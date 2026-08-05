import { useState, useEffect, useRef } from 'react'
import { submitSwipes } from '../services/gameService'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { ALL_ATTRIBUTES as ATTRIBUTES, ATTR_EMOJI } from '../data/gameData'
import { getMatchInfo, computeCompatibility } from '../logic/gameLogic'
import PersonalityPanel from '../components/PersonalityPanel'
import PostorCard from '../components/PostorCard'
import PersonalNotes from '../components/PersonalNotes'
import EventBanner from '../components/EventBanner'
import MatchHistory from '../components/MatchHistory'

export default function SwipeScreen({ roomCode, game, playerId, otherPlayers, mySwipes, myHand, sortedPlayers }) {
  const recommendations  = game.recommendations  ?? {}
  const recommendations2 = game.recommendations2 ?? {}
  const personalities    = game.personalities    ?? {}
  const swipeDecisions   = game.swipeDecisions   ?? {}
  const event            = game.activeEvent      ?? null
  const myOwnTokens = game.players?.[playerId]?.ownTokens ?? 0
  const myEarned    = game.players?.[playerId]?.earnedTokens ?? 0
  const swipeTime   = game.settings?.swipeTime ?? 0   // 0 = unlimited

  // All recs for me: primary + secondary (3-player rule)
  const recsForMe = otherPlayers.flatMap(p => {
    const r1 = recommendations[p.id]?.[playerId]
    const r2 = recommendations2[p.id]?.[playerId]
    const out = []
    if (r1) out.push({ player: p, postor: r1 })
    if (r2) out.push({ player: p, postor: r2 })
    return out
  })

  // Remaining hand (not used in my recommendations)
  const myUsedUids = new Set([
    ...otherPlayers.map(p => recommendations[playerId]?.[p.id]?.uid),
    ...otherPlayers.map(p => recommendations2[playerId]?.[p.id]?.uid),
  ].filter(Boolean))
  const remainingHand = (myHand ?? []).filter(p => !myUsedUids.has(p.uid))

  const [swipes, setSwipes]       = useState(mySwipes ?? {})
  const [selfDates, setSelfDates] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [showRecs, setShowRecs]   = useState(false)

  const questionTokensTotal = game.settings?.questionTokens ?? 3
  const swipeQuestions      = game.swipeQuestions ?? {}
  // Count questions this player has already asked this round
  const myQuestionsAsked = (swipeQuestions[playerId] ?? []).length
  const questionsLeft    = questionTokensTotal - myQuestionsAsked

  const [openQuestion, setOpenQuestion] = useState(null) // postor uid with question panel open

  // Build available questions for a postor given player's own personality
  function buildQuestions(postor) {
    const personality = game.personalities?.[playerId] ?? []
    if (!personality.length) return []
    const { matches, ownPoints, matchedAttrs } = computeCompatibility(personality, postor)
    const attrQs = personality.map(card => ({
      id: `attr_${card.attribute}`,
      text: `¿Matcheamos en ${card.attribute}?`,
      emoji: ATTR_EMOJI[card.attribute] ?? '•',
      answer: !!matchedAttrs[card.attribute],
    }))
    return [
      ...attrQs,
      { id: 'positive',   emoji: '➕', text: '¿Esta cita me sumó puntos?',      answer: ownPoints > 0 },
      { id: 'negative',   emoji: '➖', text: '¿Esta cita me restó puntos?',      answer: ownPoints < 0 },
      { id: 'two_plus',   emoji: '✨', text: '¿Tuvimos 2 o más matches?',        answer: matches >= 2 },
      { id: 'three_plus', emoji: '💫', text: '¿Tuvimos 3 o más matches?',        answer: matches >= 3 },
    ]
  }

  async function askQuestion(postor, question) {
    if (questionsLeft <= 0) return
    const entry = {
      postorUid:  postor.uid,
      postorName: postor.name,
      questionId: question.id,
      questionText: question.text,
      answer: question.answer,
      askerName: game.players?.[playerId]?.name ?? '',
    }
    const current = swipeQuestions[playerId] ?? []
    await updateDoc(doc(db, 'games', roomCode), {
      [`swipeQuestions.${playerId}`]: [...current, entry],
    })
    setOpenQuestion(null)
  }

  // Questions already asked about a specific postor by this player
  function myQsFor(postorUid) {
    return (swipeQuestions[playerId] ?? []).filter(q => q.postorUid === postorUid)
  }

  // All questions by all players this round (for public display)
  const allQuestions = Object.entries(swipeQuestions).flatMap(([pid, qs]) =>
    (qs ?? []).map(q => ({ ...q, pid }))
  )
  const [timeLeft, setTimeLeft]   = useState(swipeTime)
  const submitRef = useRef(null)  // ref to avoid stale closure

  // Timer: count down, auto-submit on expiry
  useEffect(() => {
    if (!swipeTime || submitted) return
    if (timeLeft <= 0) {
      // Auto-reject all undecided recs and submit
      setSwipes(prev => {
        const updated = { ...prev }
        recsForMe.forEach(({ postor }) => {
          if (updated[postor.uid] == null) updated[postor.uid] = false
        })
        return updated
      })
      // Submit after state update
      setTimeout(() => submitRef.current?.(), 50)
      return
    }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, swipeTime, submitted])

  // Token accounting
  const acceptedRecs    = Object.values(swipes).filter(Boolean).length
  const selfDateCount   = selfDates.length
  const acceptedTotal   = acceptedRecs + selfDateCount

  // How many more dates can we afford?
  const freeSlots       = event?.allDatesFree ? Infinity : event?.firstDateFree ? 1 : 0
  const paidSlots       = event?.allDatesFree ? Infinity : myOwnTokens
  const maxAffordable   = Math.min(paidSlots + (event?.firstDateFree ? 1 : 0), event?.maxDates ?? Infinity)
  const canAcceptMore   = acceptedTotal < maxAffordable
  const tokensAfter     = event?.allDatesFree ? myOwnTokens : myOwnTokens - Math.max(0, acceptedTotal - (event?.firstDateFree ? 1 : 0))

  const allDecided = recsForMe.every(r => swipes[r.postor.uid] != null)

  function swipe(uid, accept) {
    if (submitted) return
    if (accept && !canAcceptMore && !swipes[uid]) return  // enforce limit
    setSwipes(prev => ({ ...prev, [uid]: accept }))
  }

  function toggleSelfDate(postor) {
    if (submitted) return
    setSelfDates(prev => {
      const exists = prev.find(p => p.uid === postor.uid)
      if (exists) return prev.filter(p => p.uid !== postor.uid)
      if (!canAcceptMore) return prev  // enforce limit
      return [...prev, postor]
    })
  }

  async function handleSubmit() {
    if (submitted) return
    setLoading(true)
    try {
      await submitSwipes(roomCode, playerId, swipes, selfDates)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }
  submitRef.current = handleSubmit

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
        {swipeTime > 0 && !submitted && (
          <div className={`inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full font-mono font-bold text-sm ${
            timeLeft <= 30 ? 'bg-rose-100 text-rose-600 animate-pulse' :
            timeLeft <= 60 ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            ⏱ {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
          </div>
        )}
        {!submitted && questionTokensTotal > 0 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            {Array.from({ length: questionTokensTotal }).map((_, i) => (
              <span key={i} className={`text-lg transition-all ${
                i < questionsLeft ? 'opacity-100' : 'opacity-20'
              }`}>❓</span>
            ))}
            <span className="text-xs text-gray-500 ml-1">
              {questionsLeft > 0 ? `${questionsLeft} pregunta${questionsLeft > 1 ? 's' : ''} disponible${questionsLeft > 1 ? 's' : ''}` : 'Sin preguntas'}
            </span>
          </div>
        )}
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

      {game.activeEvent && <EventBanner event={game.activeEvent} />}

      {/* Public questions log — visible to all */}
      {allQuestions.length > 0 && (
        <div className="card border-amber-200 bg-amber-50">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
            ❓ Preguntas de la ronda
          </p>
          <div className="space-y-1.5">
            {allQuestions.map((q, i) => {
              const askerName = q.askerName || sortedPlayers.find(p => p.id === q.pid)?.name || ''
              return (
                <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 text-xs">
                  <span className="text-gray-500 font-medium">{askerName.split(' ')[0]}</span>
                  <span className="text-gray-300">→</span>
                  <span className="text-gray-600 flex-1">{q.postorName}: {q.questionText}</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    q.answer ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                  }`}>{q.answer ? 'Sí ✓' : 'No ✗'}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Token counter — live preview */}
      <div className={`card border-2 transition-all ${
        !canAcceptMore && acceptedTotal > 0 ? 'border-rose-400 bg-rose-50' :
        tokensAfter <= 1 ? 'border-amber-300 bg-amber-50' :
        'border-emerald-200 bg-emerald-50'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🪙</span>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-gray-800">{myOwnTokens} propios · {myEarned} ⭐ ganados</span>
              {acceptedTotal > 0 && !event?.allDatesFree && (
                <>
                  <span className="text-gray-400">→</span>
                  <span className={`font-bold text-lg ${tokensAfter < 0 ? 'text-rose-600' : tokensAfter === 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {tokensAfter} después
                  </span>
                </>
              )}
              {event?.allDatesFree && <span className="text-xs text-emerald-600 font-medium">🎀 Citas gratis esta ronda</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {acceptedTotal > 0
                ? `${acceptedTotal} cita${acceptedTotal > 1 ? 's' : ''} seleccionada${acceptedTotal > 1 ? 's' : ''}`
                : 'Cada cita recomendada cuesta 1 token · las propias también'}
              {!canAcceptMore && !event?.allDatesFree && ' · sin margen para más'}
            </p>
          </div>
          {!canAcceptMore && !event?.allDatesFree && acceptedTotal > 0 && (
            <span className="text-xs text-rose-600 font-bold bg-rose-100 px-2 py-1 rounded-lg">Límite</span>
          )}
          {canAcceptMore && !event?.allDatesFree && (
            <span className={`text-sm font-bold ${maxAffordable - acceptedTotal === 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
              +{maxAffordable === Infinity ? '∞' : maxAffordable - acceptedTotal} más
            </span>
          )}
        </div>
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
          <PersonalNotes roomCode={roomCode} playerId={playerId} game={game} />

          {/* Collapsible: my recommendations */}
          {(() => {
            const myRecs = otherPlayers.flatMap(p => {
              const r1 = recommendations[playerId]?.[p.id]
              const r2 = recommendations2[playerId]?.[p.id]
              const out = []
              if (r1) out.push({ player: p, postor: r1, label: '' })
              if (r2) out.push({ player: p, postor: r2, label: ' (2ª)' })
              return out
            })
            if (!myRecs.length) return null
            return (
              <div className="card">
                <button onClick={() => setShowRecs(v => !v)}
                  className="w-full flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    💌 Mis recomendaciones
                  </p>
                  <span className="text-gray-400 text-sm">{showRecs ? '▲' : '▼'}</span>
                </button>
                {showRecs && (
                  <div className="mt-2 space-y-2">
                    {myRecs.map(({ player, postor, label }, i) => {
                      const recipPersonality = personalities[player.id] ?? []
                      const mi = getMatchInfo(recipPersonality, postor)
                      return (
                        <div key={i} className="bg-rose-50 rounded-xl p-2 border border-rose-100 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-rose-600">
                              → {player.name.split(' ')[0]}{label}: <span className="text-gray-700">{postor.name}</span>
                            </p>
                            {mi && (
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                mi.score > 0 ? 'bg-emerald-100 text-emerald-700' :
                                mi.score < 0 ? 'bg-rose-100 text-rose-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {mi.score > 0 ? '+' : ''}{mi.score} pts
                              </span>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            {ATTRIBUTES.filter(a => postor[a.name]).map(attr => {
                              const info = mi?.attrs?.[attr.name]
                              return (
                                <div key={attr.name} className={`flex items-center gap-1 rounded px-1 ${
                                  info?.type === 'match' ? 'bg-emerald-50' :
                                  info?.type === 'opponent' ? 'bg-rose-50' : ''
                                }`}>
                                  <span>{attr.emoji}</span>
                                  <span className={`flex-1 ${
                                    info?.type === 'match' ? 'text-emerald-700 font-semibold' :
                                    info?.type === 'opponent' ? 'text-rose-600 font-semibold' :
                                    'text-gray-500'
                                  }`}>{postor[attr.name]}</span>
                                  {info?.type === 'match' && <span className="text-emerald-600 font-bold">+{info.pts}</span>}
                                  {info?.type === 'opponent' && <span className="text-rose-500 font-bold">−{info.pts}</span>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Match history */}
          {(game.roundHistory ?? []).length > 0 && (
            <MatchHistory roundHistory={game.roundHistory} playerId={playerId} players={game.players} />
          )}
        </div>

        {/* RIGHT */}
        <div className="flex-1 space-y-4">
          {/* Received recommendations */}
          {recsForMe.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Te proponen ({recsForMe.length}) — aceptar da +1⭐ a quien propone
              </p>
              <div className="grid grid-cols-2 gap-3">
                {recsForMe.map(({ player, postor }) => {
                  const decision = swipes[postor.uid]
                  const isBlocked = !canAcceptMore && decision !== true && !submitted
                  return (
                    <div key={postor.uid} className={`rounded-2xl overflow-hidden border-2 transition-all ${
                      decision === true ? 'border-emerald-400' :
                      decision === false ? 'border-gray-200 opacity-60' :
                      isBlocked ? 'border-gray-100 opacity-50' :
                      'border-rose-100'
                    }`}>
                      <PostorCard postor={postor} badge={`💌 ${player.name.split(' ')[0]}`} />

                      {/* Questions asked about this postor */}
                      {myQsFor(postor.uid).length > 0 && (
                        <div className="bg-amber-50 border-t border-amber-100 px-3 py-2 space-y-1">
                          {myQsFor(postor.uid).map((q, qi) => (
                            <div key={qi} className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 flex-1">{q.questionText}</span>
                              <span className={`font-bold px-2 py-0.5 rounded-full ${
                                q.answer ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                              }`}>{q.answer ? 'Sí ✓' : 'No ✗'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Question picker */}
                      {!submitted && questionsLeft > 0 && openQuestion === postor.uid && (
                        <div className="bg-amber-50 border-t border-amber-200 px-3 py-3">
                          <p className="text-xs font-semibold text-amber-700 mb-2">
                            ❓ Preguntar ({questionsLeft} restante{questionsLeft > 1 ? 's' : ''})
                          </p>
                          <div className="space-y-1">
                            {buildQuestions(postor)
                              .filter(q => !myQsFor(postor.uid).find(asked => asked.questionId === q.id))
                              .map(q => (
                                <button key={q.id} onClick={() => askQuestion(postor, q)}
                                  className="w-full text-left text-xs px-3 py-2 rounded-xl bg-white border border-amber-200 hover:border-amber-400 text-gray-700 transition-all">
                                  {q.emoji} {q.text}
                                </button>
                              ))}
                          </div>
                          <button onClick={() => setOpenQuestion(null)}
                            className="text-xs text-gray-400 mt-2 w-full text-center">Cerrar</button>
                        </div>
                      )}

                      {!submitted && questionTokensTotal > 0 && openQuestion !== postor.uid && questionsLeft > 0 && (
                        <button onClick={() => setOpenQuestion(postor.uid)}
                          className="w-full text-xs text-amber-600 bg-amber-50 hover:bg-amber-100 border-t border-amber-100 py-1.5 transition-all">
                          ❓ Preguntar sobre esta cita
                        </button>
                      )}
                      {!submitted && (
                        <div className="flex gap-2 p-3 bg-white border-t border-rose-50">
                          <button
                            onClick={() => swipe(postor.uid, true)}
                            disabled={isBlocked}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                              decision === true ? 'bg-emerald-500 text-white' :
                              isBlocked ? 'bg-gray-100 text-gray-300 cursor-not-allowed' :
                              'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}>💚 Aceptar</button>
                          <button
                            onClick={() => swipe(postor.uid, false)}
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

          {/* Remaining hand — multiple self-dates allowed */}
          {!event?.noSelfDates && remainingHand.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tu mano sobrante</p>
              <p className="text-xs text-gray-400 mb-2">
                Puedes salir con uno o más tú solo — cuesta 1🪙 cada uno, nadie gana tokens por ello
              </p>
              <div className="grid grid-cols-2 gap-3">
                {remainingHand.map(postor => {
                  const isSelected = selfDates.some(p => p.uid === postor.uid)
                  const isBlocked = !isSelected && !canAcceptMore && !submitted
                  return (
                    <div key={postor.uid} className={`rounded-2xl overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-purple-400' :
                      isBlocked ? 'border-gray-100 opacity-50' :
                      'border-gray-200'
                    }`}>
                      <PostorCard postor={postor} />
                      {!submitted && (
                        <div className="p-3 bg-white border-t border-gray-100">
                          <button
                            onClick={() => toggleSelfDate(postor)}
                            disabled={isBlocked}
                            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                              isSelected ? 'bg-purple-500 text-white' :
                              isBlocked ? 'bg-gray-100 text-gray-300 cursor-not-allowed' :
                              'bg-purple-50 text-purple-600 hover:bg-purple-100'
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
                ? `✓ Confirmar — ${acceptedTotal} cita${acceptedTotal !== 1 ? 's' : ''}`
                : `Falta decidir ${recsForMe.filter(r => swipes[r.postor.uid] == null).length}`}
            </button>
          ) : (
            <div className="card text-center py-4">
              <p className="text-emerald-600 font-semibold">✓ Confirmado</p>
              <p className="text-sm text-gray-500 mt-1">{acceptedTotal} cita{acceptedTotal !== 1 ? 's' : ''} esta ronda</p>
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
