import { useState } from 'react'
import { submitSoulmateSelection } from '../services/gameService'
import { ALL_POSTORS } from '../data/gameData'
import PersonalityPanel from '../components/PersonalityPanel'
import PostorCard from '../components/PostorCard'

export default function SoulmateScreen({ roomCode, game, playerId, myPersonality, myHand, roundHistory, sortedPlayers }) {
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  const soulmateSelections = game.soulmateSelections ?? {}
  const soulmateHands = game.soulmateHands ?? {}
  const myHandIds = soulmateHands[playerId] ?? []
  const whoConfirmed = Object.keys(soulmateSelections).filter(pid => soulmateSelections[pid] != null)

  // Previous dates: postors chosen in each round
  const previousDates = roundHistory
    .map(({ round, results }) => {
      const postorId = results?.[playerId]?.postorId
      if (postorId == null) return null
      return { round, postor: ALL_POSTORS[postorId], matches: results[playerId].matches }
    })
    .filter(Boolean)

  // Hand postors (excluding ones already chosen in previous rounds)
  const previousIds = new Set(previousDates.map(d => d.postor.id))
  const handPostors = myHandIds.map(id => ALL_POSTORS[id]).filter(p => !previousIds.has(p.id))

  async function handleConfirm() {
    if (!selected || confirmed) return
    setLoading(true)
    try {
      await submitSoulmateSelection(roomCode, playerId, selected)
      setConfirmed(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto space-y-4">
      <div className="text-center pt-2">
        <div className="text-4xl mb-1">💞</div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda final</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">Elige tu soulmate</h2>
        <p className="text-sm text-gray-500 mt-1">Esta vez decides tú solo, sin recomendaciones</p>
      </div>

      {/* Who confirmed */}
      <div className="card flex items-center gap-2 py-2 flex-wrap">
        <span className="text-xs text-gray-500">Listos:</span>
        {sortedPlayers.map(p => {
          const done = whoConfirmed.includes(p.id)
          return (
            <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {done ? '✓' : '⏳'} {p.name.split(' ')[0]}
            </span>
          )
        })}
      </div>

      {/* My personality reminder */}
      <div className="card border-rose-200 bg-rose-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lo que crees saber de ti</p>
        <PersonalityPanel personality={myPersonality} showValues={false} compact />
        <p className="text-xs text-gray-400 mt-2 italic">Confía en tu intuición acumulada</p>
      </div>

      {/* Previous dates */}
      {previousDates.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Tus citas anteriores
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {previousDates.map(({ round, postor, matches }) => (
              <PostorCard
                key={`prev-${postor.id}`}
                postor={postor}
                selected={selected === postor.id}
                onClick={() => !confirmed && setSelected(postor.id)}
                disabled={confirmed}
                badge={`Ronda ${round} · ${matches} ✨`}
                highlighted={selected === postor.id}
                mini
              />
            ))}
          </div>
        </div>
      )}

      {/* Hand postors */}
      {handPostors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Tu mano
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {handPostors.map(postor => (
              <PostorCard
                key={`hand-${postor.id}`}
                postor={postor}
                selected={selected === postor.id}
                onClick={() => !confirmed && setSelected(postor.id)}
                disabled={confirmed}
                mini
              />
            ))}
          </div>
        </div>
      )}

      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="btn-primary w-full text-lg sticky bottom-4"
        >
          {loading ? 'Confirmando...' : selected
            ? `💞 ${ALL_POSTORS[selected]?.name} es mi soulmate`
            : 'Elige tu soulmate'}
        </button>
      ) : (
        <div className="card text-center py-6">
          <div className="text-3xl mb-2">💞</div>
          <p className="text-emerald-600 font-bold text-lg">¡Elegiste a {ALL_POSTORS[selected]?.name}!</p>
          <p className="text-xs text-gray-400 mt-2">Esperando a los demás para revelar todo...</p>
          <div className="flex justify-center gap-1 mt-3">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
