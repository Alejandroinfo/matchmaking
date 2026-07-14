import { useState } from 'react'
import { submitRecommendations } from '../services/gameService'
import { ALL_ATTRIBUTES } from '../data/gameData'
import { getMatchInfo } from '../logic/gameLogic'
import PersonalityPanel from '../components/PersonalityPanel'
import PostorCard from '../components/PostorCard'
import AntagonistTable from '../components/AntagonistTable'
import MatchHistory from '../components/MatchHistory'
import PersonalNotes from '../components/PersonalNotes'
import EventBanner from '../components/EventBanner'

export default function RecommendationScreen({
  roomCode, game, playerId, otherPlayers, myHand, myRecommendations, roundHistory
}) {
  const [selectedRecipient, setSelectedRecipient] = useState(otherPlayers[0]?.id ?? null)
  const [recs, setRecs] = useState(myRecommendations)
  const [recs2, setRecs2] = useState({}) // second rec per player (3-player rule)
  const [pickingSecond, setPickingSecond] = useState(false) // true when selecting 2nd rec
  const [submitted, setSubmitted] = useState(
    Object.keys(myRecommendations).length === otherPlayers.length && otherPlayers.length > 0
  )
  const [loading, setLoading] = useState(false)
  const [showAntagonists, setShowAntagonists] = useState(false)

  const rpp = game.recsPerPlayer ?? 1 // recs per player (2 for 3-player games)

  const allDone = rpp === 1
    ? otherPlayers.every(p => recs[p.id] != null)
    : otherPlayers.every(p => recs[p.id] != null && recs2[p.id] != null)
  const whoSubmitted = Object.keys(game.recommendations ?? {})

  function pickPostor(postor) {
    if (submitted) return
    const uid = postor.uid

    if (rpp === 1) {
      setRecs(prev => ({ ...prev, [selectedRecipient]: postor }))
    } else {
      // Check if already used for any OTHER recipient
      const usedByOther = Object.entries(recs).some(([pid, p]) => p?.uid === uid && pid !== selectedRecipient)
        || Object.entries(recs2).some(([pid, p]) => p?.uid === uid && pid !== selectedRecipient)
      if (usedByOther) return // can't assign same postor to two recipients

      const isCurrentPrimary   = recs[selectedRecipient]?.uid === uid
      const isCurrentSecondary = recs2[selectedRecipient]?.uid === uid

      if (isCurrentPrimary) {
        // Deselect primary, promote secondary to primary
        setRecs(prev => {
          const n = { ...prev }
          if (recs2[selectedRecipient]) {
            n[selectedRecipient] = recs2[selectedRecipient]
            setRecs2(p2 => { const n2 = { ...p2 }; delete n2[selectedRecipient]; return n2 })
          } else {
            delete n[selectedRecipient]
          }
          return n
        })
      } else if (isCurrentSecondary) {
        // Deselect secondary
        setRecs2(prev => { const n = { ...prev }; delete n[selectedRecipient]; return n })
      } else if (!recs[selectedRecipient]) {
        setRecs(prev => ({ ...prev, [selectedRecipient]: postor }))
      } else if (!recs2[selectedRecipient]) {
        setRecs2(prev => ({ ...prev, [selectedRecipient]: postor }))
      } else {
        // Both slots full — replace primary, clear secondary
        setRecs(prev => ({ ...prev, [selectedRecipient]: postor }))
        setRecs2(prev => { const n = { ...prev }; delete n[selectedRecipient]; return n })
      }
    }
  }

  async function handleSubmit() {
    if (!allDone || submitted) return
    setLoading(true)
    try {
      await submitRecommendations(roomCode, playerId, recs, rpp === 2 ? recs2 : null)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const recipientPlayer = otherPlayers.find(p => p.id === selectedRecipient)
  const recipientPersonality = game.personalities?.[selectedRecipient] ?? []
  const numOptions = game.settings?.numOptions ?? 6
  const numAttributes = game.settings?.numAttributes ?? 4

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto space-y-4">

      {/* Header */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Recomienda</p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">Elige de tu mano un postor para cada jugador</h2>
      </div>

      {/* Submitted progress */}
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

      {/* Active event */}
      {game.activeEvent && <EventBanner event={game.activeEvent} />}

      {/* ── MOBILE: compact sticky bar ── */}
      {recipientPlayer && (
        <div className="lg:hidden sticky top-14 z-10 bg-rose-50 border border-rose-200 rounded-2xl px-3 py-2 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-gray-800">Para: {recipientPlayer.name.split(' ')[0]}</span>
            <span className="text-gray-300">|</span>
            {recipientPersonality.map(card => {
              const attr = ALL_ATTRIBUTES.find(a => a.name === card.attribute)
              return <span key={card.attribute} className="text-gray-600">{attr?.emoji} {card.value}</span>
            })}
            {recs[selectedRecipient] && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-rose-600 font-medium">💌 {recs[selectedRecipient].name}</span>
                {!submitted && (
                  <button onClick={() => setRecs(prev => { const n={...prev}; delete n[selectedRecipient]; return n })}
                    className="text-rose-400 hover:text-rose-600 ml-auto">✕</button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE: recipient tabs ── */}
      <div className="lg:hidden flex gap-2 flex-wrap">
        {otherPlayers.map(p => (
          <button key={p.id} onClick={() => setSelectedRecipient(p.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-sm font-semibold transition-all ${
              selectedRecipient === p.id ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
            }`}>
            {p.name.split(' ')[0]} {recs[p.id] ? '✓' : ''}
          </button>
        ))}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-start">

        {/* ── LEFT: PC sticky panel (selected recipient only) ── */}
        <div className="hidden lg:block lg:w-80 flex-shrink-0">
          <div className="sticky top-14 space-y-4">

            {/* Recipient switcher */}
            <div className="card">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recomendando para</p>
              <div className="flex flex-wrap gap-2">
                {otherPlayers.map(p => (
                  <button key={p.id} onClick={() => setSelectedRecipient(p.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
                      selectedRecipient === p.id
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                    }`}>
                    {p.name.split(' ')[0]}
                    {recs[p.id] && <span className="text-emerald-300 text-xs ml-0.5">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected recipient personality */}
            {recipientPlayer && (
              <div className="card border-rose-200 bg-rose-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-sm font-bold text-white">
                    {recipientPlayer.name.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-800">{recipientPlayer.name}</span>
                </div>
                <PersonalityPanel personality={recipientPersonality} showValues />
                {recs[selectedRecipient] && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5">
                      <span className="text-rose-500">💌</span>
                      <span className="text-sm text-rose-700 flex-1 font-semibold truncate">
                        {rpp === 2 ? '1ª: ' : ''}{recs[selectedRecipient].name}
                      </span>
                      {!submitted && (
                        <button onClick={() => setRecs(prev => { const n={...prev}; delete n[selectedRecipient]; return n })}
                          className="text-xs text-rose-400 hover:text-rose-600 flex-shrink-0">✕</button>
                      )}
                    </div>
                    {rpp === 2 && recs2[selectedRecipient] && (
                      <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5">
                        <span className="text-rose-400">💌</span>
                        <span className="text-sm text-rose-600 flex-1 font-semibold truncate">
                          2ª: {recs2[selectedRecipient].name}
                        </span>
                        {!submitted && (
                          <button onClick={() => setRecs2(prev => { const n={...prev}; delete n[selectedRecipient]; return n })}
                            className="text-xs text-rose-400 hover:text-rose-600 flex-shrink-0">✕</button>
                        )}
                      </div>
                    )}
                    {rpp === 2 && !recs2[selectedRecipient] && (
                      <p className="text-xs text-rose-400 px-3">Elige una 2ª recomendación</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {roundHistory.length > 0 && (
              <MatchHistory roundHistory={roundHistory} playerId={playerId} players={game.players} />
            )}
            <PersonalNotes roomCode={roomCode} playerId={playerId} />
            <button onClick={() => setShowAntagonists(v => !v)} className="btn-secondary w-full text-sm">
              {showAntagonists ? '▲ Ocultar ayuda' : '▼ Ver tabla de ayuda'}
            </button>
            {showAntagonists && <AntagonistTable numOptions={numOptions} numAttributes={numAttributes} />}
          </div>
        </div>

        {/* ── RIGHT: hand cards (scrollable) ── */}
        <div className="flex-1 space-y-4">

          {/* Mobile: extras */}
          <div className="lg:hidden space-y-3">
            {roundHistory.length > 0 && (
              <MatchHistory roundHistory={roundHistory} playerId={playerId} players={game.players} />
            )}
            <PersonalNotes roomCode={roomCode} playerId={playerId} />
            <button onClick={() => setShowAntagonists(v => !v)} className="btn-secondary w-full text-sm">
              {showAntagonists ? '▲ Ocultar ayuda' : '▼ Ver tabla de ayuda'}
            </button>
            {showAntagonists && <AntagonistTable numOptions={numOptions} numAttributes={numAttributes} />}
          </div>

          {/* Hand */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Tu mano ({myHand.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {myHand.map(postor => {
                const assignedTo = Object.entries(recs).find(([, p]) => p?.uid === postor.uid)
                const assignedTo2 = Object.entries(recs2).find(([, p]) => p?.uid === postor.uid)
                const assignedName = assignedTo
                  ? `→ ${otherPlayers.find(p => p.id === assignedTo[0])?.name.split(' ')[0]}`
                  : assignedTo2
                  ? `→ ${otherPlayers.find(p => p.id === assignedTo2[0])?.name.split(' ')[0]} (2ª)`
                  : null
                const isSelected = recs[selectedRecipient]?.uid === postor.uid || recs2[selectedRecipient]?.uid === postor.uid
                return (
                  <div key={postor.uid} onClick={() => !submitted && pickPostor(postor)} className="cursor-pointer">
                    <PostorCard
                      postor={postor}
                      selected={isSelected}
                      badge={assignedName}
                      matchInfo={selectedRecipient ? getMatchInfo(recipientPersonality, postor) : null}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Submit */}
          {!submitted ? (
            <button onClick={handleSubmit} disabled={!allDone || loading} className="btn-primary w-full sticky bottom-4">
              {loading ? 'Enviando...' : allDone
                ? '✓ Enviar recomendaciones'
                : `Faltan ${otherPlayers.length - Object.keys(recs).length} por asignar`}
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
