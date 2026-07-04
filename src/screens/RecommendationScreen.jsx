import { useState } from 'react'
import { submitRecommendations } from '../services/gameService'
import { ALL_POSTORS } from '../data/gameData'
import { getRoleLabel, getRoleColor } from '../logic/gameLogic'
import PersonalityPanel from '../components/PersonalityPanel'
import PostorCard from '../components/PostorCard'
import AntagonistTable from '../components/AntagonistTable'

export default function RecommendationScreen({
  roomCode, game, playerId, otherPlayers, myRoles, myRecommendations
}) {
  const [selectedRecipient, setSelectedRecipient] = useState(otherPlayers[0]?.id ?? null)
  const [recs, setRecs] = useState(myRecommendations)
  const [submitted, setSubmitted] = useState(!!Object.keys(myRecommendations).length)
  const [loading, setLoading] = useState(false)
  const [showAntagonists, setShowAntagonists] = useState(false)

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
  const recipientRole = myRoles[selectedRecipient]

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Recomienda</p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">¿A quién le mandas con quién?</h2>
      </div>

      {/* Submitted progress */}
      <div className="card flex items-center gap-2 py-3 flex-wrap">
        <span className="text-xs text-gray-500">Enviados:</span>
        {Object.keys(game.players ?? {}).map(pid => {
          const done = whoSubmitted.includes(pid)
          return (
            <span key={pid} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {done ? '✓' : '⏳'} {game.players[pid]?.name.split(' ')[0]}
            </span>
          )
        })}
      </div>

      {/* Two-column layout on wider screens */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* LEFT: all personalities + recipient sticky panel */}
        <div className="lg:w-80 space-y-4 flex-shrink-0">

          {/* All personalities */}
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Personalidades</p>
            <div className="space-y-3">
              {otherPlayers.map(p => {
                const personality = game.personalities?.[p.id] ?? []
                const role = myRoles[p.id]
                const isSelected = p.id === selectedRecipient
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedRecipient(p.id)}
                    className={`border-b border-rose-50 last:border-0 pb-3 last:pb-0 cursor-pointer rounded-xl px-2 -mx-2 transition-colors ${
                      isSelected ? 'bg-rose-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">
                          {p.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{p.name}</span>
                        {recs[p.id] != null && <span className="text-emerald-500 text-xs">✓</span>}
                      </div>
                      {role && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(role)}`}>
                          {getRoleLabel(role)}
                        </span>
                      )}
                    </div>
                    <PersonalityPanel personality={personality} showValues compact />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Antagonist reference toggle */}
          <button
            onClick={() => setShowAntagonists(v => !v)}
            className="btn-secondary w-full text-sm"
          >
            {showAntagonists ? '▲ Ocultar opuestos' : '▼ Ver tabla de opuestos'}
          </button>
          {showAntagonists && <AntagonistTable />}
        </div>

        {/* RIGHT: sticky recipient card + postors grid */}
        <div className="flex-1 space-y-4">

          {/* Recipient selector tabs */}
          <div className="flex gap-2 flex-wrap">
            {otherPlayers.map(p => {
              const done = recs[p.id] != null
              const role = myRoles[p.id]
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedRecipient(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-sm font-semibold transition-all ${
                    selectedRecipient === p.id
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                  }`}
                >
                  {p.name.split(' ')[0]}
                  <span>{done ? '✓' : role === 'friend' ? '💚' : role === 'enemy' ? '💔' : '😐'}</span>
                </button>
              )
            })}
          </div>

          {/* Sticky recipient card */}
          {recipientPlayer && (
            <div className="sticky top-14 z-10 card border-rose-300 bg-rose-50 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-200 flex items-center justify-center text-sm font-bold text-rose-600">
                    {recipientPlayer.name.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-800">Recomendando para: {recipientPlayer.name}</span>
                </div>
                {recipientRole && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(recipientRole)}`}>
                    {getRoleLabel(recipientRole)}
                  </span>
                )}
              </div>
              <PersonalityPanel personality={recipientPersonality} showValues compact />
              {recs[selectedRecipient] != null && (
                <div className="mt-2 flex items-center gap-2 bg-white rounded-xl px-3 py-1.5">
                  <span className="text-rose-500 text-sm">💌</span>
                  <span className="text-sm text-rose-700 flex-1">
                    <strong>{ALL_POSTORS[recs[selectedRecipient]]?.name}</strong>
                  </span>
                  {!submitted && (
                    <button
                      onClick={() => setRecs(prev => { const n = {...prev}; delete n[selectedRecipient]; return n })}
                      className="text-xs text-rose-400 hover:text-rose-600"
                    >✕ Cambiar</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Postors grid — adaptive columns */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Postores ({deployedPostors.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {deployedPostors.map(postor => (
                <PostorCard
                  key={postor.id}
                  postor={postor}
                  selected={recs[selectedRecipient] === postor.id}
                  onClick={() => !submitted && pickPostor(postor.id)}
                  disabled={submitted}
                  mini
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!allDone || loading}
              className="btn-primary w-full sticky bottom-4"
            >
              {loading ? 'Enviando...' : allDone
                ? '✓ Enviar recomendaciones'
                : `Faltan ${otherPlayers.length - Object.keys(recs).length} por elegir`}
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
        </div>
      </div>

      <div className="h-4" />
    </div>
  )
}
