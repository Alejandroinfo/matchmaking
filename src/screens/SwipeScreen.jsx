import { useState } from 'react'
import { submitSwipes } from '../services/gameService'
import { ATTRIBUTES } from '../data/gameData'
import PersonalityPanel from '../components/PersonalityPanel'
import PostorCard from '../components/PostorCard'

export default function SwipeScreen({ roomCode, game, playerId, otherPlayers, mySwipes, myHand, sortedPlayers }) {
  const recommendations = game.recommendations ?? {}
  const personalities = game.personalities ?? {}
  const swipeDecisions = game.swipeDecisions ?? {}

  const recsForMe = otherPlayers
    .map(p => ({ player: p, postor: recommendations[p.id]?.[playerId] }))
    .filter(r => r.postor)

  // Remaining hand: not used in my recommendations
  const myUsedUids = new Set(
    otherPlayers.map(p => recommendations[playerId]?.[p.id]?.uid).filter(Boolean)
  )
  const remainingHand = (myHand ?? []).filter(p => !myUsedUids.has(p.uid))

  const [swipes, setSwipes] = useState(mySwipes ?? {})
  const [selfDate, setSelfDate] = useState(null) // postor or null
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const allDecided = recsForMe.every(r => swipes[r.postor.uid] != null)
  const acceptedCount = Object.values(swipes).filter(Boolean).length + (selfDate ? 1 : 0)

  function swipe(uid, accept) {
    if (submitted) return
    setSwipes(prev => ({ ...prev, [uid]: accept }))
  }

  function toggleSelfDate(postor) {
    if (submitted) return
    setSelfDate(prev => prev?.uid === postor.uid ? null : postor)
  }

  async function handleSubmit() {
    if (!allDecided || submitted) return
    setLoading(true)
    try {
      await submitSwipes(roomCode, playerId, swipes, selfDate)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const whoSubmitted = Object.keys(swipeDecisions).filter(pid => {
    const recsReceived = otherPlayers.filter(p => recommendations[p.id]?.[pid])
    return recsReceived.every(p => {
      const postor = recommendations[p.id][pid]
      return swipeDecisions[pid]?.[postor?.uid] != null
    })
  })

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Swipe</p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">¿Con quién sales?</h2>
      </div>

      {/* Progress */}
      <div className="card flex items-center gap-2 py-2 flex-wrap">
        <span className="text-xs text-gray-500">Listos:</span>
        {sortedPlayers.map(p => {
          const done = whoSubmitted.includes(p.id)
          return (
            <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              {done ? '✓' : '⏳'} {p.name.split(' ')[0]}
            </span>
          )
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT: personalities */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Personalidades</p>
            <div className="space-y-4">
              {otherPlayers.map(p => (
                <div key={p.id} className="border-b border-rose-50 last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">{p.name.charAt(0)}</div>
                    <span className="text-sm font-semibold text-gray-700">{p.name}</span>
                  </div>
                  <PersonalityPanel personality={personalities[p.id] ?? []} showValues />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 space-y-4">
          {/* Received recommendations */}
          {recsForMe.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Te proponen ({recsForMe.length}) — aceptar da +1 pt a quien propone
              </p>
              <div className="space-y-3">
                {recsForMe.map(({ player, postor }) => {
                  const decision = swipes[postor.uid]
                  return (
                    <div key={postor.uid} className={`rounded-2xl overflow-hidden border-2 transition-all ${
                      decision === true ? 'border-emerald-400' :
                      decision === false ? 'border-gray-200 opacity-60' :
                      'border-rose-100'
                    }`}>
                      <PostorCard
                        postor={postor}
                        badge={`💌 ${player.name.split(' ')[0]}`}
                      />
                      {!submitted && (
                        <div className="flex gap-2 p-3 bg-white border-t border-rose-50">
                          <button onClick={() => swipe(postor.uid, true)}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                              decision === true ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}>💚 Aceptar</button>
                          <button onClick={() => swipe(postor.uid, false)}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                              decision === false ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}>❌ Rechazar</button>
                        </div>
                      )}
                      {submitted && (
                        <div className={`px-3 py-2 text-sm font-bold text-center ${decision ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                          {decision ? '💚 Aceptado' : '❌ Rechazado'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Remaining hand — self-date option */}
          {remainingHand.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tu mano sobrante</p>
              <p className="text-xs text-gray-400 mb-2">Puedes salir con una tú solo — nadie gana puntos por ello, pero te la juegas</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {remainingHand.map(postor => {
                  const isSelected = selfDate?.uid === postor.uid
                  return (
                    <div key={postor.uid} className={`rounded-2xl overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-purple-400' : 'border-gray-200'
                    }`}>
                      <PostorCard postor={postor} />
                      {!submitted && (
                        <div className="p-3 bg-white border-t border-gray-100">
                          <button onClick={() => toggleSelfDate(postor)}
                            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                              isSelected ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                            }`}>
                            {isSelected ? '🎲 Salgo con este' : '🎲 Salir yo solo'}
                          </button>
                        </div>
                      )}
                      {submitted && isSelected && (
                        <div className="px-3 py-2 text-sm font-bold text-center bg-purple-50 text-purple-600">
                          🎲 Cita propia
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!submitted ? (
            <button onClick={handleSubmit} disabled={!allDecided || loading} className="btn-primary w-full sticky bottom-4">
              {loading ? '...' : allDecided
                ? `✓ Confirmar — ${acceptedCount} cita${acceptedCount !== 1 ? 's' : ''}`
                : `Falta decidir ${recsForMe.length - Object.keys(swipes).length}`}
            </button>
          ) : (
            <div className="card text-center py-4">
              <p className="text-emerald-600 font-semibold">✓ Confirmado</p>
              <p className="text-sm text-gray-500 mt-1">{acceptedCount} cita{acceptedCount !== 1 ? 's' : ''} esta ronda</p>
              <div className="flex justify-center gap-1 mt-2">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-4" />
    </div>
  )
}
