import { useState, useEffect } from 'react'
import { subscribeToGame, getOrCreatePlayerId } from '../services/gameService'

export function useGame(roomCode) {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const playerId = getOrCreatePlayerId()

  useEffect(() => {
    if (!roomCode) return
    setLoading(true)
    const unsub = subscribeToGame(roomCode, data => {
      setGame(data)
      setLoading(false)
    })
    return () => unsub()
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
    myRoles: game?.roles?.[playerId] ?? {},
    myHand: game?.hands?.[playerId] ?? [],
    mySelection: game?.selections?.[playerId] ?? null,
    myRecommendations: game?.recommendations?.[playerId] ?? {},
    myResult: game?.roundResults?.[playerId] ?? null,
    roundHistory: game?.roundHistory ?? [],
    sortedPlayers,
    otherPlayers: sortedPlayers.filter(p => p.id !== playerId),
  }
}
