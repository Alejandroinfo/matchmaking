import { nextRound } from '../services/gameService'
import { ATTR_ORDER, ATTR_EMOJI } from '../data/gameData'
import EventBanner from '../components/EventBanner'

export default function RevealScreen({ roomCode, game, playerId, isHost, sortedPlayers }) {
  const results = game.roundResults ?? {}
  const roundHistory = game.roundHistory ?? []
  const isLastRound = game.round >= game.settings.totalRounds
  const myResult = results[playerId]
  const recommendations = game.recommendations ?? {}

  // Token changes this round (from last history entry)
  const lastHistory = roundHistory[roundHistory.length - 1]
  const tokenChanges = lastHistory?.tokenChanges ?? {}
  const matchmakingTrack = game.matchmakingTrack ?? {}
  const trackGains = game.matchmakingTrackGains ?? {}
  const maxTrack = Math.max(0, ...Object.values(matchmakingTrack))
  const revealMode = game.settings?.revealMode ?? 'matches'
  const myPlayer = sortedPlayers.find(p => p.id === playerId)
  const myOwnTokens    = myPlayer?.ownTokens    ?? 0
  const myEarnedTokens = myPlayer?.earnedTokens ?? 0

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Resultados</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">Resultados de la ronda 🎉</h2>
      </div>

      {game.activeEvent && <EventBanner event={game.activeEvent} />}

      {/* Matchmaking track */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          🏹 Track de matchmaking <span className="text-gray-400 font-normal">(líder al final gana +3 pts)</span>
        </p>
        <div className="space-y-2">
          {[...sortedPlayers]
            .sort((a, b) => (matchmakingTrack[b.id] ?? 0) - (matchmakingTrack[a.id] ?? 0))
            .map(p => {
              const total = matchmakingTrack[p.id] ?? 0
              const gain = trackGains[p.id] ?? 0
              const pct = maxTrack > 0 ? (total / maxTrack) * 100 : 0
              const isMe = p.id === playerId
              const isLeader = total === maxTrack && maxTrack > 0
              return (
                <div key={p.id} className={`space-y-1 ${isMe ? 'font-semibold' : ''}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">
                      {isLeader && '👑 '}{p.name.split(' ')[0]} {isMe && '(tú)'}
                    </span>
                    <span className="text-gray-500">
                      {total} matches {gain > 0 && <span className="text-emerald-600">+{gain} esta ronda</span>}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${isLeader ? 'bg-rose-500' : 'bg-rose-200'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* My round summary — compact, no confusing token deltas */}
      {myResult && (
        <div className="card border-rose-200 bg-rose-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu ronda</p>

          {/* Bet result */}
          {(() => {
            const decl = game.betDeclarations?.[playerId]
            if (!decl || decl.skipped || decl.declared === null) return null
            const actualTotal = (myResult?.acceptedDates ?? []).reduce((s, d) => s + (d.matches ?? 0), 0)
            const correct = decl.declared === actualTotal
            return (
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm mb-2 ${
                correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-100'
              }`}>
                <span>{correct ? '✓' : '✗'}</span>
                <span className="flex-1 text-xs">Apuesta: {decl.declared} — real: {actualTotal}</span>
                <span className={`font-bold text-xs ${correct ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {correct ? '+1 🪙' : 'Sin recuperar'}
                </span>
              </div>
            )
          })()}

          {/* Citas summary */}
          {(() => {
            const dates = myResult.acceptedDates ?? []
            const totalMatches = dates.reduce((s, d) => s + (d.matches ?? 0), 0)
            return dates.length === 0
              ? <p className="text-sm text-gray-400 italic text-center py-1">Sin citas esta ronda</p>
              : (
                <div className="flex gap-2">
                  <div className="flex-1 bg-white rounded-xl px-3 py-2 text-center">
                    <p className="text-xs text-gray-400">Citas</p>
                    <p className="font-bold text-gray-800">{dates.length}</p>
                  </div>
                  <div className="flex-1 bg-white rounded-xl px-3 py-2 text-center">
                    <p className="text-xs text-gray-400">Matches</p>
                    <p className="font-bold text-gray-800">{totalMatches} ✨</p>
                  </div>
                  <div className="flex-1 bg-rose-100 rounded-xl px-3 py-2 text-center">
                    <p className="text-xs text-rose-400">Compat.</p>
                    <p className="font-bold text-rose-400">🔒</p>
                  </div>
                </div>
              )
          })()}

          {/* My tokens — clear */}
          <div className="flex gap-2 mt-2">
            <div className="flex-1 bg-white rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-gray-400">🪙 Propios</p>
              <p className="font-bold text-gray-800">{myOwnTokens}</p>
            </div>
            <div className="flex-1 bg-emerald-50 rounded-xl px-3 py-2 text-center border border-emerald-100">
              <p className="text-xs text-emerald-500">⭐ Ganados</p>
              <p className="font-bold text-emerald-700">{myEarnedTokens}</p>
            </div>
          </div>
        </div>
      )}

      {/* Score parcial de los demás (no se ve el propio) */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Puntuación parcial de los demás
          <span className="text-gray-300 font-normal ml-1">(tokens + citas, sin soulmate)</span>
        </p>
        <div className="space-y-2">
          {[...sortedPlayers]
            .filter(p => p.id !== playerId)
            .sort((a, b) => {
              const scoreA = (a.ownTokens ?? 0) + (a.earnedTokens ?? 0) + (a.datePoints ?? 0)
              const scoreB = (b.ownTokens ?? 0) + (b.earnedTokens ?? 0) + (b.datePoints ?? 0)
              return scoreB - scoreA
            })
            .map((p, i) => {
              const tokenPts = (p.ownTokens ?? 0) + (p.earnedTokens ?? 0)
              const datePts  = p.datePoints ?? 0
              const partial  = tokenPts + datePts
              return (
                <div key={p.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
                  <span className="text-sm">{['🥇','🥈','🥉'][i] ?? '·'}</span>
                  <span className="text-sm font-medium text-gray-700 flex-1">{p.name}</span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>🪙{tokenPts}</span>
                    {datePts !== 0 && (
                      <span className={datePts > 0 ? 'text-emerald-600' : 'text-rose-500'}>
                        📅{datePts > 0 ? '+' : ''}{datePts}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-gray-800 text-sm">{partial} pts</span>
                </div>
              )
            })}
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">Tu puntuación parcial es visible solo para los demás</p>
      </div>

      {/* All players */}
      <div className="space-y-3">
        {sortedPlayers.filter(p => p.id !== playerId).map(p => {
          const r = results[p.id]
          const myRecForP = recommendations[playerId]?.[p.id]
          const pAcceptedMine = myRecForP && r?.acceptedDates?.some(d => d.postor?.uid === myRecForP.uid)
          const pTokenChange = tokenChanges[p.id] ?? 0

          return (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
                    {p.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-800">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${pTokenChange >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {pTokenChange >= 0 ? '+' : ''}{pTokenChange} 🪙
                  </span>
                  <span className="text-xs text-gray-500">→ {p.tokens ?? 0} total</span>
                </div>
              </div>

              {/* Totals — mode-dependent */}
              {(() => {
                const dates = r?.acceptedDates ?? []
                const totalMatches = dates.reduce((s, d) => s + (d.matches ?? 0), 0)
                const totalPoints = dates.reduce((s, d) => s + (d.ownPoints ?? 0), 0)
                const numDates = dates.length
                if (numDates === 0) return <p className="text-xs text-gray-400 italic">Sin citas</p>
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-600">{numDates} cita{numDates > 1 ? 's' : ''}</span>
                      {revealMode === 'matches'
                        ? <span className="text-xs font-bold text-gray-700">{totalMatches} ✨ total</span>
                        : <span className="text-xs text-gray-400 italic">matches ocultos</span>
                      }
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-600">Compatibilidad total</span>
                      {revealMode === 'points'
                        ? <span className={`text-xs font-bold ${totalPoints >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {totalPoints >= 0 ? '+' : ''}{totalPoints} pts
                          </span>
                        : <span className="text-xs text-gray-400 italic">oculto</span>
                      }
                    </div>
                  </div>
                )
              })()}

              {myRecForP && (
                <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg font-medium ${
                  pAcceptedMine ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {pAcceptedMine ? '💚 Aceptó tu recomendación → +1 🪙 para ti' : '❌ Rechazó tu recomendación'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isHost ? (
        <button onClick={() => nextRound(roomCode)} className="btn-primary w-full text-lg">
          {isLastRound ? '💞 Elegir soulmate' : `Ronda ${game.round + 1} →`}
        </button>
      ) : (
        <div className="card text-center py-3">
          <p className="text-sm text-gray-500">Esperando al host...</p>
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}
