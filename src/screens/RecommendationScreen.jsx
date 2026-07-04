import { useState } from 'react'
import { submitRecommendations } from '../services/gameService'
import { ATTRIBUTES } from '../data/gameData'
import PersonalityPanel from '../components/PersonalityPanel'
import AntagonistTable from '../components/AntagonistTable'
import MatchHistory from '../components/MatchHistory'

function PostorCard({ postor, selected, onClick, disabled, badge }) {
  return (
    <button onClick={onClick} disabled={disabled && !selected}
      className={`w-full text-left p-3 rounded-2xl border transition-all ${
        selected ? 'border-rose-400 bg-rose-50 shadow-sm' :
        disabled ? 'border-gray-100 bg-gray-50 opacity-60' :
        'border-rose-100 bg-white hover:border-rose-300'
      }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">
          {postor.name.charAt(0)}
        </div>
        <p className="font-semibold text-gray-800 text-sm truncate flex-1">{postor.name}</p>
        {selected && <span className="text-rose-500 text-sm">💘</span>}
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        {ATTRIBUTES.map(attr => (
          <div key={attr.name} className="flex items-center gap-1 text-xs">
            <span>{attr.emoji}</span>
            <span className="text-gray-600 truncate">{postor[attr.name]}</span>
          </div>
        ))}
      </div>
      {badge && <p className="mt-1.5 text-xs text-amber-600">{badge}</p>}
    </button>
  )
}

export default function RecommendationScreen({
  roomCode, game, playerId, otherPlayers, myHand, myRecommendations, roundHistory
}) {
  const [selectedRecipient, setSelectedRecipient] = useState(otherPlayers[0]?.id ?? null)
  // recs: { [toId]: postorObject }
  const [recs, setRecs] = useState(myRecommendations)
  const [submitted, setSubmitted] = useState(Object.keys(myRecommendations).length === otherPlayers.length && otherPlayers.length > 0)
  const [loading, setLoading] = useState(false)
  const [showAntagonists, setShowAntagonists] = useState(false)

  const allDone = otherPlayers.every(p => recs[p.id] != null)
  const whoSubmitted = Object.keys(game.recommendations ?? {})
  const usedUids = new Set(Object.values(recs).filter(Boolean).map(p => p.uid))

  function pickPostor(postor) {
    if (submitted) return
    setRecs(prev => ({ ...prev, [selectedRecipient]: postor }))
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
    <div className="min-h-screen p-4 max-w-5xl mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Recomienda</p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">Elige de tu mano un postor para cada jugador</h2>
      </div>

      {/* Progress */}
      <div className="card flex items-center gap-2 py-2 flex-wrap">
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

      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT: personalities + history */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Personalidades</p>
            <div className="space-y-4">
              {otherPlayers.map(p => {
                const personality = game.personalities?.[p.id] ?? []
                const isSelected = p.id === selectedRecipient
                return (
                  <div key={p.id} onClick={() => setSelectedRecipient(p.id)}
                    className={`border-b border-rose-50 last:border-0 pb-3 last:pb-0 cursor-pointer rounded-xl px-2 -mx-2 transition-colors ${isSelected ? 'bg-rose-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{p.name}</span>
                      {recs[p.id] && <span className="text-emerald-500 text-xs ml-auto">✓</span>}
                    </div>
                    <PersonalityPanel personality={personality} showValues />
                  </div>
                )
              })}
            </div>
          </div>

          {roundHistory.length > 0 && (
            <MatchHistory roundHistory={roundHistory} playerId={playerId} players={game.players} />
          )}

          <button onClick={() => setShowAntagonists(v => !v)} className="btn-secondary w-full text-sm">
            {showAntagonists ? '▲ Ocultar opuestos' : '▼ Ver tabla de opuestos'}
          </button>
          {showAntagonists && <AntagonistTable />}
        </div>

        {/* RIGHT: recipient + hand */}
        <div className="flex-1 space-y-4">
          {/* Recipient tabs */}
          <div className="flex gap-2 flex-wrap">
            {otherPlayers.map(p => (
              <button key={p.id} onClick={() => setSelectedRecipient(p.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-sm font-semibold transition-all ${
                  selectedRecipient === p.id ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                }`}>
                {p.name.split(' ')[0]} {recs[p.id] ? '✓' : ''}
              </button>
            ))}
          </div>

          {/* Sticky recipient card */}
          {recipientPlayer && (
            <div className="sticky top-14 z-10 card border-rose-300 bg-rose-50 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-rose-200 flex items-center justify-center text-sm font-bold text-rose-600">
                  {recipientPlayer.name.charAt(0)}
                </div>
                <span className="font-bold text-gray-800">Para: {recipientPlayer.name}</span>
              </div>
              <PersonalityPanel personality={recipientPersonality} showValues />
              {recs[selectedRecipient] && (
                <div className="mt-2 flex items-center gap-2 bg-white rounded-xl px-3 py-1.5">
                  <span className="text-rose-500">💌</span>
                  <span className="text-sm text-rose-700 flex-1 font-semibold">{recs[selectedRecipient].name}</span>
                  {!submitted && (
                    <button onClick={() => setRecs(prev => { const n = {...prev}; delete n[selectedRecipient]; return n })}
                      className="text-xs text-rose-400 hover:text-rose-600">✕ Cambiar</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hand */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu mano ({myHand.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myHand.map(postor => {
                const assignedTo = Object.entries(recs).find(([, p]) => p?.uid === postor.uid)
                const assignedName = assignedTo ? otherPlayers.find(p => p.id === assignedTo[0])?.name.split(' ')[0] : null
                return (
                  <PostorCard
                    key={postor.uid}
                    postor={postor}
                    selected={recs[selectedRecipient]?.uid === postor.uid}
                    onClick={() => !submitted && pickPostor(postor)}
                    disabled={submitted}
                    badge={assignedName ? `→ Para ${assignedName}` : null}
                  />
                )
              })}
            </div>
          </div>

          {!submitted ? (
            <button onClick={handleSubmit} disabled={!allDone || loading} className="btn-primary w-full sticky bottom-4">
              {loading ? 'Enviando...' : allDone ? '✓ Enviar recomendaciones' : `Faltan ${otherPlayers.length - Object.keys(recs).length} por asignar`}
            </button>
          ) : (
            <div className="card text-center py-4">
              <p className="text-emerald-600 font-semibold">✓ Recomendaciones enviadas</p>
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
