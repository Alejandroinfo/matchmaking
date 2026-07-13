import { useState } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { ATTR_ORDER, ATTR_EMOJI } from '../data/gameData'
import EventBanner from '../components/EventBanner'
import MatchHistory from '../components/MatchHistory'

export default function BetScreen({ roomCode, game, playerId, sortedPlayers }) {
  const roundResults = game.roundResults ?? {}
  const myResult = roundResults[playerId]
  const myDates = myResult?.acceptedDates ?? []
  const canBet = myDates.length > 0

  // Max possible matches: numAttributes * numDates
  const numAttributes = game.settings?.numAttributes ?? 4
  const maxMatches = numAttributes * myDates.length

  const [declared, setDeclared] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const declarations = game.betDeclarations ?? {}
  const whoSubmitted = Object.keys(declarations)
  // Players with dates who haven't submitted yet
  const waitingFor = sortedPlayers.filter(p => {
    const hasDates = (roundResults[p.id]?.acceptedDates?.length ?? 0) > 0
    return hasDates && !whoSubmitted.includes(p.id)
  })
  const allDone = waitingFor.length === 0

  async function handleSubmit() {
    if (declared === null || submitted) return
    setLoading(true)
    await updateDoc(doc(db, 'games', roomCode), {
      [`betDeclarations.${playerId}`]: { declared, numDates: myDates.length },
    })
    setSubmitted(true)
    setLoading(false)
  }

  async function handleSkip() {
    if (submitted) return
    setLoading(true)
    await updateDoc(doc(db, 'games', roomCode), {
      [`betDeclarations.${playerId}`]: { declared: null, skipped: true },
    })
    setSubmitted(true)
    setLoading(false)
  }

  async function handleReveal() {
    // Settle bets and move to reveal
    const players = { ...game.players }
    const playerIds = Object.keys(players)
    const results = game.roundResults ?? {}

    const event = game.activeEvent ?? null
    const betReward = event?.betDoubleOrNothing ? 2 : (event?.betReward ?? 1)

    playerIds.forEach(pid => {
      const decl = declarations[pid]
      if (!decl || decl.skipped || decl.declared === null) return
      const actualTotal = (results[pid]?.acceptedDates ?? []).reduce((s, d) => s + (d.matches ?? 0), 0)
      const correct = decl.declared === actualTotal
      if (correct) {
        players[pid] = {
          ...players[pid],
          ownTokens: (players[pid].ownTokens ?? 0) + betReward,
        }
      }
    })

    await updateDoc(doc(db, 'games', roomCode), {
      phase: 'reveal',
      players,
      betSettled: true,
    })
  }

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Apuesta</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">¿Cuántos matches tuviste? 🎲</h2>
        <p className="text-sm text-gray-500 mt-1">
          Acierta → recuperas 1 🪙 de los tuyos
        </p>
      </div>

      {/* Progress */}
      <div className="card flex items-center gap-2 py-2 flex-wrap">
        <span className="text-xs text-gray-500">Declararon:</span>
        {sortedPlayers.map(p => {
          const hasDates = (roundResults[p.id]?.acceptedDates?.length ?? 0) > 0
          if (!hasDates) return (
            <span key={p.id} className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-300">
              {p.name.split(' ')[0]}
            </span>
          )
          const done = whoSubmitted.includes(p.id)
          return (
            <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {done ? '✓' : '⏳'} {p.name.split(' ')[0]}
            </span>
          )
        })}
      </div>

      {/* Active event */}
      {game.activeEvent && <EventBanner event={game.activeEvent} />}

      {/* Match history from previous rounds — helpful for estimating */}
      {(game.roundHistory ?? []).length > 0 && (
        <MatchHistory roundHistory={game.roundHistory} playerId={playerId} players={game.players} />
      )}

      {!canBet ? (
        <div className="card text-center py-6 text-gray-400">
          <p className="text-2xl mb-2">😴</p>
          <p className="font-medium">No saliste con nadie esta ronda</p>
          <p className="text-sm mt-1">No puedes participar en la apuesta</p>
        </div>
      ) : !submitted ? (
        <>
          {/* My dates reminder */}
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tus citas de esta ronda</p>
            <div className="space-y-3">
              {myDates.map((d, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="font-semibold text-gray-700 text-sm mb-1.5">{d.postor?.name}</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {ATTR_ORDER.filter(name => d.postor?.[name]).map(name => (
                      <div key={name} className="flex items-center gap-1 text-xs">
                        <span>{ATTR_EMOJI[name]}</span>
                        <span className="text-gray-600">{d.postor[name]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Declaration */}
          <div className="card">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Total de matches en tus {myDates.length} cita{myDates.length > 1 ? 's' : ''} (0–{maxMatches})
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: maxMatches + 1 }, (_, k) => (
                <button
                  key={k}
                  onClick={() => setDeclared(k)}
                  className={`w-12 h-12 rounded-2xl font-bold text-lg border transition-all ${
                    declared === k
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-110'
                      : 'bg-white text-gray-700 border-rose-100 hover:border-rose-300'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSkip} disabled={loading} className="btn-secondary flex-1">
              Pasar
            </button>
            <button onClick={handleSubmit} disabled={declared === null || loading} className="btn-primary flex-1">
              {loading ? '...' : declared !== null ? `Declaro ${declared} matches` : 'Elige un número'}
            </button>
          </div>
        </>
      ) : (
        <div className="card text-center py-6">
          {declarations[playerId]?.skipped ? (
            <p className="text-gray-500 font-medium">Pasaste esta ronda</p>
          ) : (
            <>
              <p className="text-emerald-600 font-bold text-lg">Declaraste {declarations[playerId]?.declared} matches</p>
              <p className="text-xs text-gray-400 mt-1">Se resuelve en el reveal</p>
            </>
          )}
          <div className="flex justify-center gap-1 mt-3">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Host reveals */}
      {game.hostId === playerId && allDone && (
        <button onClick={handleReveal} className="btn-primary w-full">
          Revelar resultados →
        </button>
      )}
      {game.hostId === playerId && !allDone && submitted && (
        <button onClick={handleReveal} className="btn-secondary w-full text-sm">
          Saltar y revelar →
        </button>
      )}
      <div className="h-4" />
    </div>
  )
}
