import { nextRound } from '../services/gameService'
import { ALL_POSTORS, ATTRIBUTES } from '../data/gameData'
import { getRoleLabel, getRoleColor } from '../logic/gameLogic'

function PostorAttributes({ postor }) {
  if (!postor) return null
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
      {ATTRIBUTES.map(attr => (
        <div key={attr.name} className="flex items-center gap-1 text-xs">
          <span>{attr.emoji}</span>
          <span className="text-gray-500">{attr.name}:</span>
          <span className="font-semibold text-gray-700">{postor[attr.name]}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevealScreen({ roomCode, game, playerId, isHost, sortedPlayers, myRoles }) {
  const results = game.roundResults ?? {}
  const isLastRound = game.round >= game.settings.totalRounds
  const myResult = results[playerId]
  const myPostor = myResult ? ALL_POSTORS[myResult.postorId] : null

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Resultados</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">¡Se revela todo! 🎉</h2>
      </div>

      {/* My result — postor attributes + matches only */}
      {myResult && myPostor && (
        <div className="card border-rose-200 bg-rose-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu cita</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">{myPostor.name}</p>
              <p className="text-rose-600 font-bold text-xl mt-0.5">{myResult.matches} ✨ matches</p>
            </div>
            <p className="text-xs text-gray-400 text-right max-w-[120px]">Los puntos exactos se revelan al final</p>
          </div>
          <PostorAttributes postor={myPostor} />
        </div>
      )}

      {/* All other players — postor + points visible, NO personality */}
      <div className="space-y-3">
        {sortedPlayers.filter(p => p.id !== playerId).map(p => {
          const r = results[p.id]
          const postor = r ? ALL_POSTORS[r.postorId] : null
          const role = myRoles[p.id]

          return (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                    {postor && <p className="text-xs text-gray-400">Eligió: {postor.name}</p>}
                  </div>
                </div>
                {r && (
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{r.ownPoints > 0 ? '+' : ''}{r.ownPoints} pts</p>
                    <p className="text-xs text-rose-500">{r.matches} ✨</p>
                  </div>
                )}
              </div>

              <PostorAttributes postor={postor} />

              {role && r && (
                <div className={`mt-2 text-xs px-2 py-1 rounded-lg text-center font-medium ${getRoleColor(role)}`}>
                  Tu rol: {getRoleLabel(role)}
                  {role !== 'neutral' && (
                    <span className="ml-1">
                      → {role === 'friend' ? '+' : '-'}{Math.abs(r.ownPoints / 2)} pts para ti
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Scoreboard */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Puntuación acumulada</p>
        {[...sortedPlayers]
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .map((p, i) => {
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
