import { db } from '../firebase'
import { doc, setDoc, updateDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { dealPersonalities, dealHands, computeCompatibility, generatePostors } from '../logic/gameLogic'

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

export async function createRoom(playerName, settings) {
  const playerId = getOrCreatePlayerId()
  const roomCode = generateRoomCode()
  await setDoc(doc(db, 'games', roomCode), {
    hostId: playerId,
    status: 'lobby',
    settings: { totalRounds: 4, numOptions: 6 },
    round: 0,
    phase: null,
    players: { [playerId]: { name: playerName, score: 0, joinOrder: 0 } },
    personalities: {},
    hands: {},
    recommendations: {},
    swipeDecisions: {},
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
    [`players.${playerId}`]: { name: playerName, score: 0, joinOrder },
  })
  return { roomCode, playerId }
}

export function subscribeToGame(roomCode, callback) {
  return onSnapshot(doc(db, 'games', roomCode), snap => {
    if (snap.exists()) callback(snap.data())
  })
}

export async function startGame(roomCode) {
  const ref = doc(db, 'games', roomCode)
  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  if (playerIds.length < 2) throw new Error('Necesitas al menos 2 jugadores')

  const numOptions = data.settings?.numOptions ?? 6
  const personalities = dealPersonalities(playerIds, numOptions)
  const hands = dealHands(playerIds, numOptions)

  await updateDoc(ref, {
    status: 'playing',
    round: 1,
    phase: 'recommendation',
    personalities,
    hands,
    recommendations: {},
    swipeDecisions: {},
    roundResults: {},
    roundHistory: [],
  })
}

export async function submitRecommendations(roomCode, playerId, recommendations) {
  // recommendations: { [toId]: postorObject }
  const ref = doc(db, 'games', roomCode)
  await updateDoc(ref, { [`recommendations.${playerId}`]: recommendations })

  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  const allSubmitted = playerIds.every(pid => data.recommendations?.[pid])

  if (allSubmitted) {
    await updateDoc(ref, { phase: 'swipe' })
  }
}

export async function submitSwipes(roomCode, playerId, swipeDecisions, selfDatePostor = null) {
  // swipeDecisions: { [postorUid]: true | false }
  // selfDatePostor: postor object from remaining hand (optional, no recommender points)
  const ref = doc(db, 'games', roomCode)
  await updateDoc(ref, {
    [`swipeDecisions.${playerId}`]: swipeDecisions,
    [`selfDates.${playerId}`]: selfDatePostor ?? null,
  })

  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)

  // Check if all players have swiped on all their received recommendations
  const allDone = playerIds.every(pid => {
    const recsReceived = playerIds.filter(fromId => fromId !== pid && data.recommendations?.[fromId]?.[pid])
    const pidSwipes = data.swipeDecisions?.[pid] ?? {}
    return recsReceived.every(fromId => {
      const postor = data.recommendations[fromId][pid]
      return pidSwipes[postor.uid] != null
    })
  })

  if (allDone) {
    // Compute round results
    const roundResults = {}
    playerIds.forEach(pid => {
      const acceptedDates = []

      // Accepted recommendations
      playerIds.filter(fromId => fromId !== pid).forEach(fromId => {
        const postor = data.recommendations?.[fromId]?.[pid]
        if (!postor) return
        const accepted = data.swipeDecisions?.[pid]?.[postor.uid] === true
        if (accepted) {
          const { ownPoints, matches } = computeCompatibility(data.personalities[pid], postor)
          acceptedDates.push({ postor, fromId, ownPoints, matches })
        }
      })

      // Self-date (no fromId = no recommender gets points)
      const selfDate = data.selfDates?.[pid]
      if (selfDate) {
        const { ownPoints, matches } = computeCompatibility(data.personalities[pid], selfDate)
        acceptedDates.push({ postor: selfDate, fromId: null, ownPoints, matches })
      }

      const totalOwnPoints = acceptedDates.reduce((s, d) => s + d.ownPoints, 0)
      roundResults[pid] = { acceptedDates, totalOwnPoints }
    })

    // Recommender points: +1 per accepted card
    playerIds.forEach(pid => {
      let recPoints = 0
      playerIds.filter(toId => toId !== pid).forEach(toId => {
        const postor = data.recommendations?.[pid]?.[toId]
        if (!postor) return
        const accepted = data.swipeDecisions?.[toId]?.[postor.uid] === true
        if (accepted) recPoints++
      })
      roundResults[pid].recPoints = recPoints
      roundResults[pid].totalPoints = roundResults[pid].totalOwnPoints + recPoints
    })

    // Update scores
    const updatedPlayers = { ...data.players }
    playerIds.forEach(pid => {
      updatedPlayers[pid] = {
        ...updatedPlayers[pid],
        score: (updatedPlayers[pid].score || 0) + roundResults[pid].totalPoints,
      }
    })

    // Compute remaining hand cards (for soulmate later)
    const remainingHands = {}
    playerIds.forEach(pid => {
      const usedUids = new Set(
        playerIds.filter(toId => toId !== pid).map(toId => data.recommendations?.[pid]?.[toId]?.uid).filter(Boolean)
      )
      remainingHands[pid] = (data.hands?.[pid] ?? []).find(p => !usedUids.has(p.uid)) ?? null
    })

    const roundHistory = [...(data.roundHistory ?? []), {
      round: data.round,
      results: roundResults,
      swipeDecisions: data.swipeDecisions,
      recommendations: data.recommendations,
    }]

    await updateDoc(ref, {
      phase: 'reveal',
      roundResults,
      players: updatedPlayers,
      remainingHands,
      roundHistory,
    })
  }
}

export async function nextRound(roomCode) {
  const ref = doc(db, 'games', roomCode)
  const snap = await getDoc(ref)
  const data = snap.data()
  const nextRound = data.round + 1

  if (nextRound > data.settings.totalRounds) {
    await updateDoc(ref, {
      phase: 'soulmate',
      soulmateSelections: {},
    })
    return
  }

  const playerIds = Object.keys(data.players)
  const numOptions = data.settings?.numOptions ?? 6
  const hands = dealHands(playerIds, numOptions)

  await updateDoc(ref, {
    round: nextRound,
    phase: 'recommendation',
    hands,
    recommendations: {},
    swipeDecisions: {},
    roundResults: {},
  })
}

export async function submitSoulmateSelection(roomCode, playerId, description) {
  // description: { [attributeName]: value } — player's best guess of their own personality
  const ref = doc(db, 'games', roomCode)
  await updateDoc(ref, { [`soulmateSelections.${playerId}`]: description })

  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  const allSelected = playerIds.every(pid => data.soulmateSelections?.[pid] != null)

  if (allSelected) {
    const soulmateResults = {}
    playerIds.forEach(pid => {
      const description = data.soulmateSelections[pid]
      const { ownPoints, matches } = computeCompatibility(data.personalities[pid], description)
      soulmateResults[pid] = { ownPoints: ownPoints * 2, matches, description }
    })

    const updatedPlayers = { ...data.players }
    playerIds.forEach(pid => {
      updatedPlayers[pid] = {
        ...updatedPlayers[pid],
        score: (updatedPlayers[pid].score || 0) + soulmateResults[pid].ownPoints,
      }
    })

    await updateDoc(ref, {
      status: 'finished',
      phase: 'end',
      soulmateResults,
      players: updatedPlayers,
    })
  }
}

export async function updateSettings(roomCode, settings) {
  await updateDoc(doc(db, 'games', roomCode), { settings })
}
