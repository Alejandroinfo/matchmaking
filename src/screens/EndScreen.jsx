import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startGame } from '../services/gameService'
import { ATTRIBUTES, ANTAGONISTS } from '../data/gameData'
import PersonalityPanel from '../components/PersonalityPanel'

function PostorAttrs({ postor }) {
  if (!postor) return null
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
      {ATTRIBUTES.map(attr => (
        <div key={attr.name} className="flex items-center gap-1 text-xs">
          <span>{attr.emoji}</span>
          <span className="text-gray-500">{postor[attr.name]}</span>
        </div>
      ))}
    </div>
  )
}

export default function EndScreen({ game, playerId, sortedPlayers, myPersonality, roomCode, isHost }) {
  const navigate = useNavigate()
  const [rematching, setRematching] = useState(false)

  const ranked = [...sortedPlayers].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const winner = ranked[0]
  const personalities = game.personalities ?? {}
  const roundHistory = game.roundHistory ?? []
  const soulmateResults = game.soulmateResults ?? {}

  async function handleRematch() {
    setRematching(true)
    try { await startGame(roomCode) }
    finally { setRematching(false) }
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-4">
      {/* Winner */}
      <div className="card text-center py-6 border-amber-200 bg-amber-50">
        <div className="text-5xl mb-2">🏆</div>
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Ganador/a</p>
        <h2 className="text-2xl font-bold text-gray-800 mt-1">{winner?.name} {winner?.id === playerId && '🎉'}</h2>
        <p className="text-amber-600 font-bold text-xl mt-1">{Math.round((winner?.score ?? 0) * 10) / 10} puntos</p>
      </div>

      {/* Ranking */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Clasificación final</p>
        {ranked.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-3 py-2.5 border-b border-rose-50 last:border-0 ${p.id === playerId ? 'bg-rose-50 -mx-4 px-4 rounded-xl' : ''}`}>
            <span className="text-xl w-8">{['🥇','🥈','🥉'][i] ?? `${i+1}.`}</span>
            <span className="font-medium text-gray-700 flex-1">{p.name} {p.id === playerId && <span className="text-xs text-rose-400">(tú)</span>}</span>
            <span className="font-bold text-gray-800">{Math.round((p.score ?? 0) * 10) / 10} pts</span>
          </div>
        ))}
      </div>

      {/* Per-player breakdown */}
      {sortedPlayers.map(p => {
        const isMe = p.id === playerId
        const soulmateR = soulmateResults[p.id]
        const allDates = roundHistory.flatMap(({ round, results }) =>
          (results?.[p.id]?.acceptedDates ?? []).map(d => ({ round, ...d }))
        )
        const totalRecPts = roundHistory.reduce((s, { results }) => s + (results?.[p.id]?.recPoints ?? 0), 0)

        return (
          <div key={p.id} className={`card space-y-3 ${isMe ? 'border-rose-300' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-500">
                {p.name.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-800">{p.name} {isMe && '(tú)'}</h3>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Personalidad real</p>
              <PersonalityPanel personality={personalities[p.id] ?? []} showValues />
            </div>

            {/* Round dates */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Citas por ronda</p>
              {allDates.length === 0 && <p className="text-xs text-gray-400 italic">Sin citas</p>}
              <div className="space-y-1">
                {allDates.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs font-bold text-gray-400 w-6">R{d.round}</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{d.postor?.name}</span>
                    <span className="text-rose-500 text-xs">{d.matches} ✨</span>
                    <span className={`font-bold text-sm w-14 text-right ${d.ownPoints >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {d.ownPoints > 0 ? '+' : ''}{d.ownPoints}
                    </span>
                  </div>
                ))}

                {/* Soulmate */}
                {soulmateR && (
                  <div className="mt-2 bg-rose-50 rounded-xl p-3 border border-rose-200">
                    <p className="text-xs font-bold text-rose-400 mb-2">💞 Soulmate ×2 — ¿Cuánto te conoces?</p>
                    <div className="space-y-1">
                      {ATTRIBUTES.map((attr, i) => {
                        const guessed = soulmateR.description?.[attr.name]
                        const real = (personalities[p.id] ?? []).find(c => c.attribute === attr.name)?.value
                        const correct = guessed === real
                        const antagonist = guessed && real && guessed === ANTAGONISTS[real]
                        return (
                          <div key={attr.name} className="flex items-center gap-2 text-xs">
                            <span>{attr.emoji}</span>
                            <span className="text-gray-500 w-20">{attr.name}</span>
                            <span className={`font-semibold ${correct ? 'text-emerald-600' : antagonist ? 'text-red-500' : 'text-gray-500'}`}>
                              {guessed ?? '?'}
                            </span>
                            {!correct && real && (
                              <span className="text-gray-400">→ real: <strong>{real}</strong></span>
                            )}
                            <span className="ml-auto">{correct ? '✓' : antagonist ? '✗✗' : '✗'}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-2 text-right">
                      <span className={`font-bold text-sm ${soulmateR.ownPoints >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {soulmateR.ownPoints > 0 ? '+' : ''}{soulmateR.ownPoints} pts · {soulmateR.matches} correctos
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommender points */}
            {totalRecPts > 0 && (
              <div className="bg-emerald-50 rounded-xl px-3 py-2 text-sm">
                <span className="text-emerald-700 font-medium">+{totalRecPts} pts por recomendaciones aceptadas</span>
              </div>
            )}
          </div>
        )
      })}

      <div className="flex gap-3">
        {isHost && (
          <button onClick={handleRematch} disabled={rematching} className="btn-primary flex-1">
            {rematching ? '...' : '🔄 Revancha'}
          </button>
        )}
        <button onClick={() => navigate('/')} className={isHost ? 'btn-secondary flex-1' : 'btn-primary w-full'}>
          Nuevo juego 💘
        </button>
      </div>
      <div className="h-4" />
    </div>
  )
}
