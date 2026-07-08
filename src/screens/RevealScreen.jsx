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
          🏹 Track de matchmaking <span className="text-gray-400 font-normal">(líder gana +3 pts al final)</span>
        </p>
        <div className="space-y-2">
          {[...sortedPlayers]
            .sort((a, b) => (matchmakingTrack[b.id] ?? 0) - (matchmakingTrack[a.id] ?? 0))
            .map(p => {
              const total = matchmakingTrack[p.id] ?? 0
              const gain = trackGains[p.id] ?? 0
              const pct = maxTrack > 0 ? (total / maxTrack) * 100 : 0
              const isMe = p.id === playerId
              return (
                <div key={p.id} className={`space-y-1 ${isMe ? 'font-semibold' : ''}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">{p.name.split(' ')[0]} {isMe && '(tú)'}</span>
                    <span className="text-gray-500">
                      {total} pts {gain > 0 && <span className="text-emerald-600">+{gain} esta ronda</span>}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${total === maxTrack && maxTrack > 0 ? 'bg-rose-500' : 'bg-rose-200'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* My tokens this round */}
      {myResult && (
        <div className="card border-rose-200 bg-rose-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tus tokens esta ronda</p>
            <div className={`text-lg font-bold ${(tokenChanges[playerId] ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {(tokenChanges[playerId] ?? 0) >= 0 ? '+' : ''}{tokenChanges[playerId] ?? 0} 🪙
            </div>
          </div>
          {/* Bet result if applicable */}
          {(() => {
            const decl = game.betDeclarations?.[playerId]
            if (!decl || decl.skipped || decl.declared === null) return null
            const actualTotal = (myResult?.acceptedDates ?? []).reduce((s, d) => s + (d.matches ?? 0), 0)
            const correct = decl.declared === actualTotal
            return (
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm mb-2 ${
                correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-100 border border-rose-200'
              }`}>
                <span>{correct ? '✓' : '✗'}</span>
                <span className="flex-1">
                  Declaraste {decl.declared} matches — real: {actualTotal}
                </span>
                <span className={`font-bold ${correct ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {correct ? '+1 🪙 recuperado' : 'Sin recuperar'}
                </span>
              </div>
            )
          })()}
          {/* +3 received this round */}
          <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2 mb-2">
            <span className="text-xs text-emerald-700 flex-1">+3 tokens de la ronda</span>
            <span className="text-xs font-bold text-emerald-700">+3 🪙</span>
          </div>
          <div className="space-y-1.5">
            {(myResult.acceptedDates ?? []).map((d, i) => {
              const fromName = d.fromId ? sortedPlayers.find(p => p.id === d.fromId)?.name.split(' ')[0] : null
              return (
                <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2">
                  <span className="text-sm">💚</span>
                  <span className="text-sm text-gray-700 flex-1 truncate">{d.postor?.name}</span>
                  <span className="text-xs text-gray-500">{d.matches} ✨</span>
                  <span className="text-xs text-gray-400 italic">pts ocultos</span>
                  <span className="text-xs text-rose-500 font-medium">-1 🪙</span>
                  {fromName && <span className="text-xs text-amber-600">→ {fromName} +1</span>}
                  {!fromName && <span className="text-xs text-gray-400">→ caja</span>}
                </div>
              )
            })}
            {myResult.acceptedDates?.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-2">No saliste con nadie esta ronda</p>
            )}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
              <span className="text-sm text-gray-600">Tokens restantes</span>
              <span className="font-bold text-gray-800">{sortedPlayers.find(p => p.id === playerId)?.tokens ?? 0} 🪙</span>
            </div>
          </div>
        </div>
      )}

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

              <div className="space-y-1">
                {(r?.acceptedDates ?? []).map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                    <span className="text-xs">💚</span>
                    <span className="text-xs text-gray-700 flex-1 truncate">{d.postor?.name}</span>
                    <span className="text-xs text-gray-500">{d.matches} ✨</span>
                    <span className={`text-xs font-bold ${(d.ownPoints ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {(d.ownPoints ?? 0) >= 0 ? '+' : ''}{d.ownPoints ?? 0} pts
                    </span>
                  </div>
                ))}
                {r?.acceptedDates?.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Sin citas</p>
                )}
              </div>

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

      {/* Token scoreboard */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tokens actuales</p>
        {[...sortedPlayers].sort((a, b) => (b.tokens ?? 0) - (a.tokens ?? 0)).map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 py-2 border-b border-rose-50 last:border-0">
            <span className="text-lg">{['🥇','🥈','🥉'][i] ?? '▪️'}</span>
            <span className="font-medium text-gray-700 flex-1">{p.name} {p.id === playerId && '(tú)'}</span>
            <span className="font-bold text-gray-800">{p.tokens ?? 0} 🪙</span>
          </div>
        ))}
        <p className="text-xs text-gray-400 text-center mt-2">Puntuación final = tokens + soulmate ×2</p>
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
