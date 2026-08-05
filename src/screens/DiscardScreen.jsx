import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { submitDiscardPhase } from '../services/gameService'
import PostorCard from '../components/PostorCard'

// miniphase: 'discard_left' or 'discard_right'
export default function DiscardScreen({ roomCode, game, playerId, otherPlayers, sortedPlayers }) {
  const phase = game.phase  // 'discard_left' or 'discard_right'
  const discardSelections = game.discardSelections ?? {}
  const hands = game.hands ?? {}
  const recommendations  = game.recommendations  ?? {}
  const recommendations2 = game.recommendations2 ?? {}
  const selfDates        = game.selfDates        ?? {}
  const myOwnTokens = game.players?.[playerId]?.ownTokens ?? 0

  const [selected, setSelected] = useState(null)  // postor uid
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  // Determine neighbor based on phase
  // Sort players by joinOrder for consistent circular order
  const ordered = [...sortedPlayers].sort((a, b) => (a.joinOrder ?? 0) - (b.joinOrder ?? 0))
  const myIndex = ordered.findIndex(p => p.id === playerId)

  const neighborIndex = phase === 'discard_left'
    ? (myIndex + 1) % ordered.length   // left = next in order
    : (myIndex - 1 + ordered.length) % ordered.length  // right = previous

  const neighbor = ordered[neighborIndex]

  // Get neighbor's remaining hand (not used in any rec or self-date)
  const neighborHand = hands[neighbor?.id] ?? []
  const neighborUsedUids = new Set([
    ...otherPlayers.map(p => recommendations[neighbor?.id]?.[p.id]?.uid),
    ...otherPlayers.map(p => recommendations2[neighbor?.id]?.[p.id]?.uid),
    ...(Array.isArray(selfDates[neighbor?.id])
      ? selfDates[neighbor?.id].map(p => p?.uid)
      : selfDates[neighbor?.id] ? [selfDates[neighbor?.id].uid] : []
    ),
  ].filter(Boolean))

  // Also exclude cards already chosen by others in this phase
  const chosenByOthers = new Set(
    Object.values(discardSelections)
      .filter(s => s?.neighborId === neighbor?.id && s?.postorUid)
      .map(s => s.postorUid)
  )

  const availableCards = neighborHand.filter(p =>
    !neighborUsedUids.has(p.uid) && !chosenByOthers.has(p.uid)
  )

  const canAfford = myOwnTokens > 0
  const alreadySubmitted = !!discardSelections[playerId]

  async function handleSubmit(postorUid) {
    if (submitted || alreadySubmitted || loading) return
    setLoading(true)
    const postor = postorUid ? availableCards.find(p => p.uid === postorUid) : null
    try {
      await updateDoc(doc(db, 'games', roomCode), {
        [`discardSelections.${playerId}`]: {
          neighborId: neighbor?.id ?? null,
          postorUid: postor?.uid ?? null,
          postor: postor ?? null,
          skipped: !postor,
        }
      })
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const whoSubmitted = sortedPlayers.filter(p => discardSelections[p.id])
  const allDone = whoSubmitted.length === sortedPlayers.length

  // Auto-advance when all players have decided (any player can trigger)
  useEffect(() => {
    if (allDone && !loading) {
      submitDiscardPhase(roomCode).catch(() => {})
    }
  }, [allDone])
  const phaseLabel = phase === 'discard_left' ? 'Minifase 1' : 'Minifase 2'
  const dirLabel   = phase === 'discard_left' ? 'izquierda' : 'derecha'

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
          Ronda {game.round} · {phaseLabel}
        </p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">
          Cartas sobrantes de {neighbor?.name?.split(' ')[0]}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Jugador a tu {dirLabel} · sin pitch, sin preguntas — decides a ciegas
        </p>
      </div>

      {/* Progress */}
      <div className="card flex items-center gap-2 py-2 flex-wrap">
        <span className="text-xs text-gray-500">Listos:</span>
        {sortedPlayers.map(p => (
          <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            discardSelections[p.id] ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {discardSelections[p.id] ? '✓' : '⏳'} {p.name.split(' ')[0]}
          </span>
        ))}
      </div>

      {/* Token reminder */}
      <div className={`card flex items-center gap-3 py-2.5 border ${
        !canAfford ? 'border-rose-300 bg-rose-50' : 'border-gray-200 bg-gray-50'
      }`}>
        <span className="text-lg">🪙</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">{myOwnTokens} tokens propios</p>
          <p className="text-xs text-gray-500">
            {canAfford ? 'Cuesta 1 token — nadie recibe earned tokens por esta cita' : 'Sin tokens disponibles'}
          </p>
        </div>
      </div>

      {submitted || alreadySubmitted ? (
        <div className="card text-center py-6">
          <p className="text-emerald-600 font-semibold text-lg">✓ Confirmado</p>
          {discardSelections[playerId]?.skipped
            ? <p className="text-sm text-gray-500 mt-1">Pasaste esta minifase</p>
            : <p className="text-sm text-gray-500 mt-1">Cita con {discardSelections[playerId]?.postor?.name}</p>
          }
          <div className="flex justify-center gap-1 mt-3">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        </div>
      ) : (
        <>
          {availableCards.length === 0 ? (
            <div className="card text-center py-6 text-gray-400">
              <p className="text-2xl mb-2">🃏</p>
              <p className="text-sm">No hay cartas disponibles de {neighbor?.name?.split(' ')[0]}</p>
              <p className="text-xs mt-1">Todas fueron seleccionadas o usadas</p>
              <button onClick={() => handleSubmit(null)}
                className="btn-primary mt-4 w-full">
                Continuar →
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {availableCards.map(postor => (
                  <div key={postor.uid} onClick={() => canAfford && setSelected(
                    selected === postor.uid ? null : postor.uid
                  )} className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                    selected === postor.uid ? 'border-purple-400 shadow-md' :
                    !canAfford ? 'opacity-50 cursor-not-allowed border-gray-100' :
                    'border-gray-200 hover:border-purple-200'
                  }`}>
                    <PostorCard postor={postor} />
                    {selected === postor.uid && (
                      <div className="bg-purple-50 px-3 py-1.5 text-center text-xs font-bold text-purple-600 border-t border-purple-100">
                        ✓ Seleccionada
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleSubmit(selected)}
                  disabled={!selected || loading}
                  className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                    selected ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}>
                  {loading ? '...' : selected ? '💜 Ir a esta cita (-1🪙)' : 'Elige una carta'}
                </button>
                <button onClick={() => handleSubmit(null)} disabled={loading}
                  className="px-4 py-3 rounded-2xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                  Pasar
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
