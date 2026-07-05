import { useState, useEffect } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { ALL_ATTRIBUTES } from '../data/gameData'

export default function PitchScreen({ roomCode, game, playerId, isHost, otherPlayers, sortedPlayers }) {
  const pitchTime = game.settings?.pitchTime ?? 60
  const [timeLeft, setTimeLeft] = useState(pitchTime)
  const [loading, setLoading] = useState(false)

  // My recommendations to others
  const recommendations = game.recommendations ?? {}
  const myRecs = otherPlayers
    .map(p => ({ player: p, postor: recommendations[playerId]?.[p.id] }))
    .filter(r => r.postor)

  useEffect(() => {
    if (timeLeft <= 0) return
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft])

  async function handleContinue() {
    setLoading(true)
    await updateDoc(doc(db, 'games', roomCode), { phase: 'swipe' })
    setLoading(false)
  }

  const pct = (timeLeft / pitchTime) * 100
  const urgent = timeLeft <= 15

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Pitch</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">¡Convence a tus amigos! 🗣️</h2>
        <p className="text-sm text-gray-500 mt-1">Defiende tus recomendaciones antes de que decidan</p>
      </div>

      {/* Timer */}
      <div className="card text-center py-4">
        <div className={`text-5xl font-bold tabular-nums mb-3 ${urgent ? 'text-rose-500 animate-pulse' : 'text-gray-800'}`}>
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${urgent ? 'bg-rose-500' : 'bg-rose-300'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {timeLeft === 0 && (
          <p className="text-rose-500 font-semibold mt-2 text-sm">¡Tiempo!</p>
        )}
      </div>

      {/* My recommendations — what I can pitch */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tus recomendaciones</p>
        <div className="space-y-3">
          {myRecs.map(({ player, postor }) => (
            <div key={player.id} className="bg-rose-50 rounded-xl p-3 border border-rose-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-500">→ Para</span>
                <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-600">
                  {player.name.charAt(0)}
                </div>
                <span className="font-semibold text-gray-800 text-sm">{player.name.split(' ')[0]}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {postor.name.charAt(0)}
                </div>
                <span className="font-semibold text-gray-700">{postor.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {ALL_ATTRIBUTES.filter(a => postor[a.name]).map(attr => (
                  <div key={attr.name} className="flex items-center gap-1 text-xs">
                    <span>{attr.emoji}</span>
                    <span className="text-gray-600">{postor[attr.name]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Players visible */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">En la mesa</p>
        <div className="flex flex-wrap gap-2">
          {sortedPlayers.map(p => (
            <div key={p.id} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">
                {p.name.charAt(0)}
              </div>
              <span className="text-sm text-gray-700">{p.name.split(' ')[0]}</span>
              {p.id === playerId && <span className="text-xs text-rose-400">(tú)</span>}
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <button
          onClick={handleContinue}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? '...' : timeLeft > 0 ? 'Saltar al swipe →' : 'Continuar al swipe →'}
        </button>
      )}
      {!isHost && (
        <div className="card text-center py-3">
          <p className="text-sm text-gray-500">
            {timeLeft > 0 ? 'Esperando que acabe el tiempo o el host continúe...' : 'Esperando al host...'}
          </p>
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}
