import { useState } from 'react'
import { submitRecommendations } from '../services/gameService'
import { ALL_POSTORS } from '../data/gameData'
import { ATTRIBUTES } from '../data/gameData'
import PersonalityPanel from '../components/PersonalityPanel'
import PostorCard from '../components/PostorCard'

export default function RecommendationScreen({
  roomCode, game, playerId, otherPlayers, myRecommendations
}) {
  const [selectedRecipient, setSelectedRecipient] = useState(otherPlayers[0]?.id ?? null)
  const [recs, setRecs] = useState(myRecommendations)
  const [submitted, setSubmitted] = useState(!!Object.keys(myRecommendations).length)
  const [loading, setLoading] = useState(false)

  const deployedPostors = (game.deployedPostors ?? []).map(id => ALL_POSTORS[id])
  const allDone = otherPlayers.every(p => recs[p.id] != null)
  const whoSubmitted = Object.keys(game.recommendations ?? {})

  function pickPostor(postorId) {
    if (submitted) return
    setRecs(prev => ({ ...prev, [selectedRecipient]: postorId }))
  }

  async function handleSubmit() {
    if (!allDone || submitted) return
    setLoading(true)
    try {
      await submitRecommendations(roomCode, playerId, recs)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const recipientPlayer = otherPlayers.find(p => p.id === selectedRecipient)
  const recipientPersonality = game.personalities?.[selectedRecipient] ?? []

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      {/* Round header */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Recomienda</p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">¿A quién le mandas con quién?</h2>
        <p className="text-xs text-gray-500 mt-1">Elige un postor para cada jugador</p>
      </div>

      {/* Progress submitted */}
      <div className="card flex items-center gap-2 py-3">
        <span className="text-xs text-gray-500">Enviados:</span>
        <div className="flex gap-1.5 flex-wrap">
          {game.sortedPlayers?.map(p => p) && Object.keys(game.players ?? {}).map(pid => {
            const submitted = whoSubmitted.includes(pid)
            const pName = game.players[pid]?.name ?? '?'
            return (
              <span key={pid} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                submitted ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {submitted ? '✓' : '⏳'} {pName.split(' ')[0]}
              </span>
            )
          })}
        </div>
      </div>

      {/* Recipient selector */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recomendando para:</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {otherPlayers.map(p => {
            const done = recs[p.id] != null
            return (
              <button
                key={p.id}
                onClick={() => setSelectedRecipient(p.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border transition-all ${
                  selectedRecipient === p.id
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white text-gray-600 border-rose-100'
                }`}
              >
                <span className="text-xs font-semibold">{p.name.split(' ')[0]}</span>
                {done && <span className="text-xs opacity-75">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected recipient personality */}
      {recipientPlayer && (
        <div className="card">
          <div className="mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Personalidad de {recipientPlayer.name.split(' ')[0]}
            </p>
          </div>
          <PersonalityPanel personality={recipientPersonality} />
        </div>
      )}

      {/* Current recommendation for recipient */}
      {recs[selectedRecipient] != null && (
        <div className="bg-rose-50 rounded-2xl px-4 py-2 flex items-center gap-2">
          <span className="text-rose-500">💌</span>
          <span className="text-sm text-rose-700">
            Recomendando: <strong>{ALL_POSTORS[recs[selectedRecipient]]?.name}</strong>
          </span>
          {!submitted && (
            <button
              onClick={() => setRecs(prev => { const n={...prev}; delete n[selectedRecipient]; return n })}
              className="ml-auto text-xs text-rose-400 hover:text-rose-600"
            >✕</button>
          )}
        </div>
      )}

      {/* Postors grid */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Postores disponibles ({deployedPostors.length})
        </p>
        <div className="grid grid-cols-1 gap-2">
          {deployedPostors.map(postor => (
            <PostorCard
              key={postor.id}
              postor={postor}
              selected={recs[selectedRecipient] === postor.id}
              onClick={() => !submitted && pickPostor(postor.id)}
              disabled={submitted}
            />
          ))}
        </div>
      </div>

      {/* Submit button */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allDone || loading}
          className="btn-primary w-full sticky bottom-4"
        >
          {loading ? 'Enviando...' : allDone ? '✓ Enviar recomendaciones' : `Faltan ${otherPlayers.length - Object.keys(recs).length} por elegir`}
        </button>
      ) : (
        <div className="card text-center py-4">
          <p className="text-emerald-600 font-semibold">✓ Recomendaciones enviadas</p>
          <p className="text-xs text-gray-400 mt-1">Esperando a los demás...</p>
          <div className="flex justify-center gap-1 mt-2">
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
