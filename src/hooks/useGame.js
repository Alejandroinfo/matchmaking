import { useState, useEffect, useRef } from 'react'
import { subscribeToGame, getOrCreatePlayerId } from '../services/gameService'
import { enableNetwork } from 'firebase/firestore'
import { db } from '../firebase'

export function useGame(roomCode) {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const playerId = getOrCreatePlayerId()
  const unsubRef = useRef(null)

  function subscribe() {
    if (!roomCode) return
    if (unsubRef.current) unsubRef.current()
    unsubRef.current = subscribeToGame(roomCode, data => {
      setGame(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    setLoading(true)
    subscribe()
    return () => { if (unsubRef.current) unsubRef.current() }
  }, [roomCode])

  // Re-enable Firestore network and resubscribe when tab becomes visible
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        enableNetwork(db)
          .then(() => subscribe())
          .catch(() => subscribe())
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [roomCode])

  const players = game?.players ?? {}
  const sortedPlayers = Object.entries(players)
    .sort(([, a], [, b]) => (a.joinOrder ?? 0) - (b.joinOrder ?? 0))
    .map(([id, p]) => ({ id, ...p }))

  return {
    game,
    loading,
    playerId,
    isHost: game?.hostId === playerId,
    myName: players[playerId]?.name ?? '',
    myPersonality: game?.personalities?.[playerId] ?? [],
    myHand: game?.hands?.[playerId] ?? [],
    myRecommendations: game?.recommendations?.[playerId] ?? {},
    mySwipes: game?.swipeDecisions?.[playerId] ?? {},
    myResult: game?.roundResults?.[playerId] ?? null,
    myRemainingHand: game?.remainingHands?.[playerId] ?? null,
    roundHistory: game?.roundHistory ?? [],
    sortedPlayers,
    otherPlayers: sortedPlayers.filter(p => p.id !== playerId),
  }
}
