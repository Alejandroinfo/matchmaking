import { db } from '../firebase'
import {
  doc, setDoc, updateDoc, getDoc, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import {
  dealPersonalities, assignRoles, selectPostors,
  computeCompatibility, computeRolePoints
} from '../logic/gameLogic'

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
    settings: {
      totalRounds: settings.totalRounds ?? 4,
      numPostors: settings.numPostors ?? 20,
    },
    round: 0,
    phase: null,
    players: {
      [playerId]: { name: playerName, score: 0, joinOrder: 0 },
    },
    personalities: {},
    roles: {},
    deployedPostors: [],
    recommendations: {},
    selections: {},
    roundResults: {},
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

  const personalities = dealPersonalities(playerIds)
  const roles = assignRoles(playerIds)
  const postorsForRound = selectPostors(data.settings.numPostors)

  await updateDoc(ref, {
    status: 'playing',
    round: 1,
    phase: 'recommendation',
    personalities,
    roles,
    deployedPostors: postorsForRound,
    recommendations: {},
    selections: {},
    roundResults: {},
  })
}

export async function submitRecommendations(roomCode, playerId, recommendations) {
  const ref = doc(db, 'games', roomCode)
  await updateDoc(ref, {
    [`recommendations.${playerId}`]: recommendations,
  })

  // Check if all players have submitted
  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  const allSubmitted = playerIds.every(pid => data.recommendations?.[pid])

  if (allSubmitted) {
    await updateDoc(ref, { phase: 'selection' })
  }
}

export async function submitSelection(roomCode, playerId, postorId) {
  const ref = doc(db, 'games', roomCode)
  await updateDoc(ref, {
    [`selections.${playerId}`]: postorId,
  })

  // Check if all players have selected
  const snap = await getDoc(ref)
  const data = snap.data()
  const playerIds = Object.keys(data.players)
  const allSelected = playerIds.every(pid => data.selections?.[pid] != null)

  if (allSelected) {
    // Compute results
    const roundResults = {}
    playerIds.forEach(pid => {
      const { ownPoints, matches } = computeCompatibility(
        data.personalities[pid],
        data.selections[pid]
      )
      roundResults[pid] = { ownPoints, matches, postorId: data.selections[pid] }
    })

    // Add role points
    playerIds.forEach(pid => {
      const rolePoints = computeRolePoints(pid, roundResults, data.roles)
      roundResults[pid].rolePoints = rolePoints
      roundResults[pid].totalPoints = roundResults[pid].ownPoints + rolePoints
    })

    // Update scores
    const updatedPlayers = { ...data.players }
    playerIds.forEach(pid => {
      updatedPlayers[pid] = {
        ...updatedPlayers[pid],
        score: (updatedPlayers[pid].score || 0) + roundResults[pid].totalPoints,
      }
    })

    await updateDoc(ref, {
      phase: 'reveal',
      roundResults,
      players: updatedPlayers,
    })
  }
}

export async function nextRound(roomCode) {
  const ref = doc(db, 'games', roomCode)
  const snap = await getDoc(ref)
  const data = snap.data()
  const nextRound = data.round + 1

  if (nextRound > data.settings.totalRounds) {
    await updateDoc(ref, { status: 'finished', phase: 'end' })
    return
  }

  const postorsForRound = selectPostors(data.settings.numPostors)

  await updateDoc(ref, {
    round: nextRound,
    phase: 'recommendation',
    deployedPostors: postorsForRound,
    recommendations: {},
    selections: {},
    roundResults: {},
  })
}

export async function updateSettings(roomCode, settings) {
  await updateDoc(doc(db, 'games', roomCode), { settings })
}
