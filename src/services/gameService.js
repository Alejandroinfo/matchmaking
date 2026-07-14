import { db } from '../firebase'
import { doc, setDoc, updateDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { dealPersonalities, dealHands, computeCompatibility, recsPerPlayer } from '../logic/gameLogic'
import { drawEvent } from '../data/events'
import { resetUsedNames } from '../data/gameData'

const TOKENS_PER_ROUND = 3

export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase()
}

export function getOrCreatePlayerId() {
  let id = localStorage.getItem('matchmaker_pid')
  if (!id) {
    id = Math.random().toString(36).substring(2, 15)
    localStorage.setItem('matchmaker_pid', id)
  }
  return id
}

export async function createRoom(playerName) {
  const playerId = getOrCreatePlayerId()
  const roomCode = generateRoomCode()
  await setDoc(doc(db, 'games', roomCode), {
    hostId: playerId,
    status: 'lobby',
    settings: { totalRounds: 3, numOptions: 6, numAttributes: 4, swipeTime: 0, enableBetting: true, enableEvents: true, revealMode: 'matches' },
    round: 0,
    phase: null,
    players: { [playerId]: { name: playerName, tokens: 0, score: 0, joinOrder: 0 } },
    personalities: {},
    hands: {},
    recommendations: {},
    swipeDecisions: {},
    selfDates: {},
    roundResults: {},
    roundHistory: [],
    createdAt: serverTimestamp(),
  })
  return { roomCode, playerId }
}

export async function joinRoom(roomCode, playerName) {
  const playerId = getOrCreatePlayerId()
  const ref = doc(db, 'games', roomCode)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Sala no encontrada')
  const data = snap.data()
  if (data.status !== 'lobby') throw new Error('La partida ya ha comenzado')
  const joinOrder = Object.keys(data.players).length
  await updateDoc(ref, {
    [`players.${playerId}`]: { name: playerName, tokens: 0, score: 0, joinOrder },
  })
  return { roomCode, playerId }
}

export function subscribeToGame(roomCode, callback) {
  return onSnapshot(doc(db, 'games', roomCode), snap => {
    if (snap.exists()) callback(snap.data())
  })
}

function addRoundTokens(players, playerIds, tokensOverride = null) {
  const updated = { ...players }
  const amount = tokensOverride ?? TOKENS_PER_ROUND
  playerIds.forEach(pid => {
    updated[pid] = { ...updated[pid], ownTokens: (updated[pid].ownTokens ?? 0) + amount }
  })
  return updated
}

function applyEventRoundStart(players, playerIds, event) {
  if (!event) return players
  let updated = { ...players }
  if (event.lowestTokenBonus) {
    const minTokens = Math.min(...playerIds.map(pid => updated[pid].ownTokens ?? 0))
    playerIds.filter(pid => (updated[pid].ownTokens ?? 0) === minTokens).forEach(pid => {
      updated[pid] = { ...updated[pid], ownTokens: (updated[pid].ownTokens ?? 0) + event.lowestTokenBonus }
    })
  }
  return updated
}

export async function startGame(roomCode) {
  const ref = doc(db, 'games', roomCode)
  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  resetUsedNames()
  if (playerIds.length < 2) throw new Error('Necesitas al menos 2 jugadores')

  const { numOptions = 6, numAttributes = 4 } = data.settings
  const personalities = dealPersonalities(playerIds, numOptions, numAttributes)
  const rpp = recsPerPlayer(playerIds.length)
  const hands = dealHands(playerIds, numOptions, numAttributes)

  const enableEvents = data.settings?.enableEvents === true
  const activeEvent = enableEvents ? drawEvent() : null
  const tokenAmount = activeEvent?.tokensThisRound ?? TOKENS_PER_ROUND
  let updatedPlayers = addRoundTokens(data.players, playerIds, tokenAmount)
  updatedPlayers = applyEventRoundStart(updatedPlayers, playerIds, activeEvent)
  playerIds.forEach(pid => {
    updatedPlayers[pid] = { ...updatedPlayers[pid], score: 0, datePoints: 0, ownTokens: updatedPlayers[pid].ownTokens ?? 0, earnedTokens: 0 }
  })

  await updateDoc(ref, {
    status: 'playing',
    round: 1,
    phase: 'recommendation',
    personalities,
    hands,
    recsPerPlayer: rpp,
    players: updatedPlayers,
    activeEvent: activeEvent ?? null,
    recommendations: {},
    recommendations2: {},
    swipeDecisions: {},
    selfDates: {},
    roundResults: {},
    roundHistory: [],
    matchmakingTrack: {},
    carryOverHands: {},
  })
}

export async function submitRecommendations(roomCode, playerId, recommendations, recommendations2 = null) {
  const ref = doc(db, 'games', roomCode)
  const update = { [`recommendations.${playerId}`]: recommendations }
  if (recommendations2) update[`recommendations2.${playerId}`] = recommendations2
  await updateDoc(ref, update)

  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  const allSubmitted = playerIds.every(pid => data.recommendations?.[pid])
  if (allSubmitted) await updateDoc(ref, { phase: 'swipe' })
}

export async function submitSwipes(roomCode, playerId, swipeDecisions, selfDatesArr = []) {
  const ref = doc(db, 'games', roomCode)
  await updateDoc(ref, {
    [`swipeDecisions.${playerId}`]: swipeDecisions,
    [`selfDates.${playerId}`]: Array.isArray(selfDatesArr) ? selfDatesArr : (selfDatesArr ? [selfDatesArr] : []),
  })

  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)

  const allDone = playerIds.every(pid => {
    const recsReceived = playerIds.filter(fromId => fromId !== pid && data.recommendations?.[fromId]?.[pid])
    return recsReceived.every(fromId => {
      const postor = data.recommendations[fromId][pid]
      return data.swipeDecisions?.[pid]?.[postor?.uid] != null
    })
  })

  if (allDone) {
    const roundResults = {}
    // ownTokenChanges and earnedTokenChanges computed below

    const event = data.activeEvent ?? null

    playerIds.forEach(pid => {
      const acceptedDates = []
      const maxDates = event?.maxDates ?? Infinity
      let datesAccepted = 0

      // Accepted recommendations (both primary and secondary for 3-player)
      const allFromIds = playerIds.filter(fromId => fromId !== pid)
      allFromIds.forEach(fromId => {
        if (datesAccepted >= maxDates) return
        // Check primary rec
        const postor = data.recommendations?.[fromId]?.[pid]
        if (postor) {
          const accepted = data.swipeDecisions?.[pid]?.[postor.uid] === true
          if (accepted) {
            const { ownPoints, matches, matchedAttrs } = computeCompatibility(data.personalities[pid], postor)
            acceptedDates.push({ postor, fromId: event?.anonymousRecs ? null : fromId, ownPoints, matches, matchedAttrs })
            datesAccepted++
          }
        }
        // Check secondary rec (3-player rule)
        if (datesAccepted < maxDates) {
          const postor2 = data.recommendations2?.[fromId]?.[pid]
          if (postor2) {
            const accepted2 = data.swipeDecisions?.[pid]?.[postor2.uid] === true
            if (accepted2) {
              const { ownPoints, matches, matchedAttrs } = computeCompatibility(data.personalities[pid], postor2)
              acceptedDates.push({ postor: postor2, fromId: event?.anonymousRecs ? null : fromId, ownPoints, matches, matchedAttrs })
              datesAccepted++
            }
          }
        }
      })

      // Self-dates — now an array, multiple allowed (disabled by noSelfDates event)
      if (!event?.noSelfDates) {
        const selfDatesRaw = data.selfDates?.[pid] ?? []
        const selfDatesArr = Array.isArray(selfDatesRaw) ? selfDatesRaw : (selfDatesRaw ? [selfDatesRaw] : [])
        for (const selfDate of selfDatesArr) {
          if (datesAccepted >= maxDates) break
          const { ownPoints, matches, matchedAttrs } = computeCompatibility(data.personalities[pid], selfDate)
          acceptedDates.push({ postor: selfDate, fromId: null, ownPoints, matches, matchedAttrs })
          datesAccepted++
        }
      }

      roundResults[pid] = { acceptedDates }
    })

    // Token changes: ownTokens spent on dates, earnedTokens received from accepted recs
    const ownTokenChanges = {}
    const earnedTokenChanges = {}
    playerIds.forEach(pid => { ownTokenChanges[pid] = 0; earnedTokenChanges[pid] = 0 })

    playerIds.forEach(pid => {
      roundResults[pid].acceptedDates.forEach((d, idx) => {
        const isFree = event?.allDatesFree || (event?.firstDateFree && idx === 0)
        if (!isFree) {
          ownTokenChanges[pid] -= 1
          if (d.fromId) earnedTokenChanges[d.fromId] += 1
        }
      })
    })

    // mostDatesBonus → earnedTokens
    if (event?.mostDatesBonus) {
      const maxAccepted = Math.max(...playerIds.map(pid => roundResults[pid].acceptedDates.length))
      if (maxAccepted > 0)
        playerIds.filter(pid => roundResults[pid].acceptedDates.length === maxAccepted)
          .forEach(pid => { earnedTokenChanges[pid] += 1 })
    }

    // mostMatchesBonus → earnedTokens
    if (event?.mostMatchesBonus) {
      const total = pid => roundResults[pid].acceptedDates.reduce((s, d) => s + d.matches, 0)
      const maxM = Math.max(...playerIds.map(total))
      if (maxM > 0)
        playerIds.filter(pid => total(pid) === maxM)
          .forEach(pid => { earnedTokenChanges[pid] += 1 })
    }

    // Apply token changes + accumulate date points
    const updatedPlayers = { ...data.players }
    playerIds.forEach(pid => {
      const datePointsThisRound = roundResults[pid].acceptedDates
        .reduce((s, d) => s + (d.ownPoints ?? 0), 0)
      updatedPlayers[pid] = {
        ...updatedPlayers[pid],
        ownTokens: Math.max(0, (updatedPlayers[pid].ownTokens ?? 0) + ownTokenChanges[pid]),
        earnedTokens: (updatedPlayers[pid].earnedTokens ?? 0) + earnedTokenChanges[pid],
        datePoints: (updatedPlayers[pid].datePoints ?? 0) + datePointsThisRound,
      }
    })

    // Also store tokenChanges for roundHistory display (combined)
    const tokenChanges = {}
    playerIds.forEach(pid => {
      tokenChanges[pid] = ownTokenChanges[pid] + earnedTokenChanges[pid]
    })

    // Compute carry-over hands if manos sobrantes event
    const carryOverHands = {}
    if (event?.carryUnused) {
      playerIds.forEach(pid => {
        const usedUids = new Set([
          ...playerIds.filter(t => t !== pid).flatMap(t => {
            const r1 = data.recommendations?.[pid]?.[t]
            const r2 = data.recommendations2?.[pid]?.[t]
            return [r1?.uid, r2?.uid].filter(Boolean)
          }),
          ...(Array.isArray(data.selfDates?.[pid])
            ? data.selfDates[pid].map(p => p?.uid)
            : [data.selfDates?.[pid]?.uid]
          ).filter(Boolean),
        ])
        carryOverHands[pid] = (data.hands?.[pid] ?? []).filter(p => !usedUids.has(p.uid))
      })
    }

    const roundHistory = [...(data.roundHistory ?? []), {
      round: data.round,
      results: roundResults,
      tokenChanges,
      recommendations: data.recommendations ?? {},
    }]

    // Compute matchmaking track: per accepted recommended date, add matches to recommender's track
    // Attribute-doubling events apply HERE (track only, not to reveal score)
    const trackGains = {}
    playerIds.forEach(pid => { trackGains[pid] = 0 })
    playerIds.forEach(pid => {
      roundResults[pid].acceptedDates
        .filter(d => d.fromId)
        .forEach(d => {
          let count = d.matches
          // If event doubles a specific attribute and it matched, count it twice
          if (event?.attr && d.matchedAttrs?.[event.attr]) count += 1
          trackGains[d.fromId] = (trackGains[d.fromId] ?? 0) + count
        })
    })

    const updatedTrack = { ...(data.matchmakingTrack ?? {}) }
    playerIds.forEach(pid => {
      updatedTrack[pid] = (updatedTrack[pid] ?? 0) + trackGains[pid]
    })

    const goToBet = data.settings?.enableBetting !== false

    await updateDoc(ref, {
      phase: goToBet ? 'bet' : 'reveal',
      roundResults,
      players: updatedPlayers,
      roundHistory,
      matchmakingTrack: updatedTrack,
      matchmakingTrackGains: trackGains,
      betDeclarations: {},
      carryOverHands,
    })
  }
}

export async function nextRound(roomCode) {
  const ref = doc(db, 'games', roomCode)
  const snap = await getDoc(ref)
  const data = snap.data()
  const next = data.round + 1

  if (next > data.settings.totalRounds) {
    await updateDoc(ref, { phase: 'soulmate', soulmateSelections: {} })
    return
  }

  const playerIds = Object.keys(data.players)
  const { numOptions = 6, numAttributes = 4 } = data.settings
  const enableEvents = data.settings?.enableEvents === true
  const activeEvent = enableEvents ? drawEvent() : null
  const tokenAmount = activeEvent?.tokensThisRound ?? TOKENS_PER_ROUND
  let updatedPlayers = addRoundTokens(data.players, playerIds, tokenAmount)
  updatedPlayers = applyEventRoundStart(updatedPlayers, playerIds, activeEvent)

  const rpp = recsPerPlayer(playerIds.length)
  const extraCards = activeEvent?.extraCards ?? 0
  const carryOver = data.carryOverHands ?? {}
  const hands = dealHands(playerIds, numOptions, numAttributes, extraCards, carryOver)

  await updateDoc(ref, {
    round: next,
    phase: 'recommendation',
    hands,
    recsPerPlayer: rpp,
    players: updatedPlayers,
    activeEvent: activeEvent ?? null,
    recommendations: {},
    recommendations2: {},
    swipeDecisions: {},
    selfDates: {},
    roundResults: {},
    betDeclarations: {},
    carryOverHands: {},
  })
}

export async function submitSoulmateSelection(roomCode, playerId, description) {
  const ref = doc(db, 'games', roomCode)
  await updateDoc(ref, { [`soulmateSelections.${playerId}`]: description })

  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  const allSelected = playerIds.every(pid => data.soulmateSelections?.[pid] != null)

  if (allSelected) {
    const soulmateResults = {}
    playerIds.forEach(pid => {
      const { ownPoints, matches } = computeCompatibility(
        data.personalities[pid],
        data.soulmateSelections[pid]
      )
      soulmateResults[pid] = { ownPoints: ownPoints * 2, matches, description: data.soulmateSelections[pid] }
    })

    // Award matchmaking track bonus: top scorer(s) get +3
    const track = data.matchmakingTrack ?? {}
    const maxTrack = playerIds.length > 0 ? Math.max(...playerIds.map(pid => track[pid] ?? 0)) : 0
    const trackWinners = maxTrack > 0 ? playerIds.filter(pid => (track[pid] ?? 0) === maxTrack) : []

    // Final score = remaining tokens + soulmate points + matchmaking bonus
    const updatedPlayers = { ...data.players }
    playerIds.forEach(pid => {
      const ownTokens    = updatedPlayers[pid].ownTokens ?? 0
      const earnedTokens = updatedPlayers[pid].earnedTokens ?? 0
      const soulmatePoints = soulmateResults[pid].ownPoints
      const matchmakingBonus = trackWinners.includes(pid) ? 3 : 0
      const datePoints = updatedPlayers[pid].datePoints ?? 0
      updatedPlayers[pid] = {
        ...updatedPlayers[pid],
        score: ownTokens + earnedTokens + soulmatePoints + matchmakingBonus + datePoints,
        matchmakingBonus,
      }
    })

    await updateDoc(ref, {
      status: 'finished',
      phase: 'end',
      soulmateResults,
      players: updatedPlayers,
      matchmakingWinners: trackWinners,
    })
  }
}

export async function updateSettings(roomCode, settings) {
  await updateDoc(doc(db, 'games', roomCode), { settings })
}
