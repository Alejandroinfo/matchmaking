import { nextRound } from '../services/gameService'
import { ATTRIBUTES } from '../data/gameData'

function PostorAttributes({ postor }) {
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
      {ATTRIBUTES.map(attr => (
        <div key={attr.name} className="flex items-center gap-1 text-xs">
          <span>{attr.emoji}</span>
          <span className="text-gray-600">{postor[attr.name]}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevealScreen({ roomCode, game, playerId, isHost, sortedPlayers }) {
  const results = game.roundResults ?? {}
  const isLastRound = game.round >= game.settings.totalRounds
  const myResult = results[playerId]

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Resultados</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">¡Resultados! 🎉</h2>
      </div>

      {/* My dates */}
      {myResult && (
        <div className="card border-rose-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tus citas esta ronda</p>
          {myResult.acceptedDates?.length === 0 && (
            <p className="text-sm text-gray-400 italic">No aceptaste ninguna cita esta ronda</p>
          )}
          <div className="space-y-2">
            {(myResult.acceptedDates ?? []).map((d, i) => (
              <div key={i} className="bg-rose-50 rounded-xl p-2.5 border border-rose-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-600">
                      {d.postor.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{d.postor.name}</span>
                  </div>
                  <span className="text-rose-500 font-bold">{d.matches} ✨</span>
                </div>
                <PostorAttributes postor={d.postor} />
                <p className="text-xs text-amber-600 mt-1.5">
                  💌 Propuesto por {sortedPlayers.find(p => p.id === d.fromId)?.name.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Los puntos exactos se revelan al final</p>
        </div>
      )}

      {/* All players — full info visible */}
      <div className="space-y-3">
        {sortedPlayers.filter(p => p.id !== playerId).map(p => {
          const r = results[p.id]
          // How many of my recommendations this player accepted
          const myRecForP = game.recommendations?.[playerId]?.[p.id]
          const pAcceptedMine = myRecForP && r?.acceptedDates?.some(d => d.postor.uid === myRecForP.uid)

          return (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
                    {p.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-gray-800">{p.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{r?.totalOwnPoints > 0 ? '+' : ''}{r?.totalOwnPoints ?? 0} compat</p>
                  {r?.recPoints > 0 && (
                    <p className="text-xs text-emerald-600">+{r.recPoints} rec pts</p>
                  )}
                </div>
              </div>

              {/* Their accepted dates */}
              <div className="space-y-1.5">
                {(r?.acceptedDates ?? []).map((d, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
                    <span className="text-sm">💚</span>
                    <span className="text-sm font-medium text-gray-700 flex-1 truncate">{d.postor.name}</span>
                    <span className="text-xs text-gray-500">{d.matches} ✨</span>
                    <span className={`text-xs font-bold ${d.ownPoints >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {d.ownPoints > 0 ? '+' : ''}{d.ownPoints} pts
                    </span>
                  </div>
                ))}
                {r?.acceptedDates?.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Sin citas esta ronda</p>
                )}
              </div>

              {/* Did they accept my recommendation? */}
              {myRecForP && (
                <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg font-medium ${
                  pAcceptedMine ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {pAcceptedMine ? '💚 Aceptó tu recomendación → +1 pt para ti' : '❌ Rechazó tu recomendación'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Scoreboard */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Puntuación acumulada</p>
        {[...sortedPlayers].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).map((p, i) => {
          const isMe = p.id === playerId
          return (
            <div key={p.id} className="flex items-center gap-3 py-2 border-b border-rose-50 last:border-0">
              <span className="text-lg">{['🥇','🥈','🥉'][i] ?? '▪️'}</span>
              <span className="font-medium text-gray-700 flex-1">{p.name} {isMe && '(tú)'}</span>
              <span className="font-bold text-gray-800">
                {isMe ? '???' : `${Math.round((p.score ?? 0) * 10) / 10} pts`}
              </span>
            </div>
          )
        })}
        <p className="text-xs text-gray-400 text-center mt-2">Tu puntuación se revela al final</p>
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
