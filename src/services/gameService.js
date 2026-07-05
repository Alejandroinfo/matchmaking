import { db } from '../firebase'
import { doc, setDoc, updateDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { dealPersonalities, dealHands, computeCompatibility } from '../logic/gameLogic'

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
    settings: { totalRounds: 3, numOptions: 6, numAttributes: 4, pitchTime: 60 },
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

function addRoundTokens(players, playerIds) {
  const updated = { ...players }
  playerIds.forEach(pid => {
    updated[pid] = { ...updated[pid], tokens: (updated[pid].tokens ?? 0) + TOKENS_PER_ROUND }
  })
  return updated
}

export async function startGame(roomCode) {
  const ref = doc(db, 'games', roomCode)
  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  if (playerIds.length < 2) throw new Error('Necesitas al menos 2 jugadores')

  const { numOptions = 6, numAttributes = 4 } = data.settings
  const personalities = dealPersonalities(playerIds, numOptions, numAttributes)
  const hands = dealHands(playerIds, numOptions, numAttributes)

  // Start round 1: give 3 tokens, reset scores
  const updatedPlayers = addRoundTokens(data.players, playerIds)
  playerIds.forEach(pid => { updatedPlayers[pid].score = 0 })

  await updateDoc(ref, {
    status: 'playing',
    round: 1,
    phase: 'recommendation',
    personalities,
    hands,
    players: updatedPlayers,
    recommendations: {},
    swipeDecisions: {},
    selfDates: {},
    roundResults: {},
    roundHistory: [],
    matchmakingTrack: {},
  })
}

export async function submitRecommendations(roomCode, playerId, recommendations) {
  const ref = doc(db, 'games', roomCode)
  await updateDoc(ref, { [`recommendations.${playerId}`]: recommendations })

  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  const allSubmitted = playerIds.every(pid => data.recommendations?.[pid])
  if (allSubmitted) await updateDoc(ref, { phase: 'pitch' })
}

export async function submitSwipes(roomCode, playerId, swipeDecisions, selfDatePostor = null) {
  const ref = doc(db, 'games', roomCode)
  await updateDoc(ref, {
    [`swipeDecisions.${playerId}`]: swipeDecisions,
    [`selfDates.${playerId}`]: selfDatePostor ?? null,
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
    const tokenChanges = {}
    playerIds.forEach(pid => { tokenChanges[pid] = 0 })

    playerIds.forEach(pid => {
      const acceptedDates = []

      // Accepted recommendations: -1 from acceptor → +1 to recommender
      playerIds.filter(fromId => fromId !== pid).forEach(fromId => {
        const postor = data.recommendations?.[fromId]?.[pid]
        if (!postor) return
        const accepted = data.swipeDecisions?.[pid]?.[postor.uid] === true
        if (accepted) {
          const { ownPoints, matches } = computeCompatibility(data.personalities[pid], postor)
          acceptedDates.push({ postor, fromId, ownPoints, matches })
          tokenChanges[pid] -= 1
          tokenChanges[fromId] += 1
        }
      })

      // Self-date: -1 from acceptor → caja (nobody gets it)
      const selfDate = data.selfDates?.[pid]
      if (selfDate) {
        const { ownPoints, matches } = computeCompatibility(data.personalities[pid], selfDate)
        acceptedDates.push({ postor: selfDate, fromId: null, ownPoints, matches })
        tokenChanges[pid] -= 1
      }

      roundResults[pid] = { acceptedDates }
    })

    // Apply token changes
    const updatedPlayers = { ...data.players }
    playerIds.forEach(pid => {
      updatedPlayers[pid] = {
        ...updatedPlayers[pid],
        tokens: Math.max(0, (updatedPlayers[pid].tokens ?? 0) + tokenChanges[pid]),
      }
    })

    const roundHistory = [...(data.roundHistory ?? []), {
      round: data.round,
      results: roundResults,
      tokenChanges,
      recommendations: data.recommendations ?? {},
    }]

    // Compute matchmaking track: per accepted recommended date, add its matches to recommender's track
    const trackGains = {}
    playerIds.forEach(pid => { trackGains[pid] = 0 })
    playerIds.forEach(pid => {
      roundResults[pid].acceptedDates
        .filter(d => d.fromId)
        .forEach(d => { trackGains[d.fromId] = (trackGains[d.fromId] ?? 0) + d.matches })
    })

    const updatedTrack = { ...(data.matchmakingTrack ?? {}) }
    playerIds.forEach(pid => {
      updatedTrack[pid] = (updatedTrack[pid] ?? 0) + trackGains[pid]
    })

    const goToVote = data.settings?.enableVoting !== false

    await updateDoc(ref, {
      phase: 'reveal',
      roundResults,
      players: updatedPlayers,
      roundHistory,
      matchmakingTrack: updatedTrack,
      matchmakingTrackGains: trackGains,
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
  const hands = dealHands(playerIds, numOptions, numAttributes)

  // Give 3 tokens for new round
  const updatedPlayers = addRoundTokens(data.players, playerIds)

  await updateDoc(ref, {
    round: next,
    phase: 'recommendation',
    hands,
    players: updatedPlayers,
    recommendations: {},
    swipeDecisions: {},
    selfDates: {},
    roundResults: {},
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
      const tokens = updatedPlayers[pid].tokens ?? 0
      const soulmatePoints = soulmateResults[pid].ownPoints
      const matchmakingBonus = trackWinners.includes(pid) ? 3 : 0
      updatedPlayers[pid] = {
        ...updatedPlayers[pid],
        score: tokens + soulmatePoints + matchmakingBonus,
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
