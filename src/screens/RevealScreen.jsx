import { nextRound } from '../services/gameService'
import { ALL_POSTORS } from '../data/gameData'
import { getRoleLabel, getRoleColor } from '../logic/gameLogic'
import PersonalityPanel from '../components/PersonalityPanel'

export default function RevealScreen({ roomCode, game, playerId, isHost, sortedPlayers, myRoles, myPersonality }) {
  const results = game.roundResults ?? {}
  const personalities = game.personalities ?? {}
  const isLastRound = game.round >= game.settings.totalRounds
  const myResult = results[playerId]

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Resultados</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">¡Se revela todo! 🎉</h2>
      </div>

      {/* My result — matches only, no points */}
      {myResult && (
        <div className="card border-rose-200 bg-rose-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu resultado</p>
          <p className="text-sm text-gray-600">
            Elegiste a <strong>{ALL_POSTORS[myResult.postorId]?.name}</strong>
          </p>
          <p className="text-rose-600 font-bold text-2xl mt-1">{myResult.matches} ✨ matches</p>
          <p className="text-xs text-gray-400 mt-1">Los puntos exactos se revelan al final del juego</p>
        </div>
      )}

      {/* My personality hint */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu personalidad (pista acumulada)</p>
        <PersonalityPanel personality={myPersonality} showValues compact />
      </div>

      {/* All other players — full points visible */}
      <div className="space-y-3">
        {sortedPlayers.filter(p => p.id !== playerId).map(p => {
          const r = results[p.id]
          const postor = r ? ALL_POSTORS[r.postorId] : null
          const personality = personalities[p.id] ?? []
          const role = myRoles[p.id]

          return (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
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

              <PersonalityPanel personality={personality} showValues compact />

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

      {/* Scoreboard — hide my score */}
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
          {isLastRound ? '🏆 Ver ganador final' : `Ronda ${game.round + 1} →`}
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
