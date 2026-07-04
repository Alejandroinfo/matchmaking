import { nextRound } from '../services/gameService'
import { ALL_POSTORS } from '../data/gameData'
import { getRoleLabel, getRoleColor } from '../logic/gameLogic'
import PersonalityPanel from '../components/PersonalityPanel'

export default function RevealScreen({ roomCode, game, playerId, isHost, sortedPlayers, myRoles, myPersonality }) {
  const results = game.roundResults ?? {}
  const personalities = game.personalities ?? {}
  const isLastRound = game.round >= game.settings.totalRounds

  function handleNext() {
    nextRound(roomCode)
  }

  const myResult = results[playerId]

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Resultados</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">¡Se revela todo! 🎉</h2>
      </div>

      {/* My personality revealed */}
      <div className="card border-rose-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu personalidad (pistas acumuladas)</p>
        <PersonalityPanel personality={myPersonality} showValues />
        {myResult && (
          <div className="mt-3 bg-rose-50 rounded-xl px-3 py-2 text-center">
            <p className="text-sm text-gray-600">
              Elegiste a <strong>{ALL_POSTORS[myResult.postorId]?.name}</strong>
            </p>
            <p className="text-rose-600 font-bold text-lg">{myResult.matches} matches ✨</p>
            <p className="text-xs text-gray-500">
              Puntos propios: <strong>{myResult.ownPoints > 0 ? '+' : ''}{myResult.ownPoints}</strong>
              {myResult.rolePoints !== 0 && (
                <span> · Puntos de rol: <strong>{myResult.rolePoints > 0 ? '+' : ''}{myResult.rolePoints}</strong></span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* All players results */}
      <div className="space-y-3">
        {sortedPlayers.map(p => {
          const r = results[p.id]
          const postor = r ? ALL_POSTORS[r.postorId] : null
          const personality = personalities[p.id] ?? []
          const isMe = p.id === playerId
          const role = myRoles[p.id]

          return (
            <div key={p.id} className={`card ${isMe ? 'border-rose-300 bg-rose-50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.name} {isMe && '(tú)'}</p>
                    {postor && <p className="text-xs text-gray-400">Eligió: {postor.name}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{Math.round((p.score ?? 0) * 10) / 10} pts</p>
                  {r && <p className="text-xs text-rose-500">{r.matches} ✨</p>}
                </div>
              </div>

              {!isMe && (
                <>
                  <PersonalityPanel personality={personality} showValues compact />
                  {role && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded-lg text-center font-medium ${getRoleColor(role)}`}>
                      Tu rol: {getRoleLabel(role)}
                      {r && role !== 'neutral' && (
                        <span className="ml-1">
                          ({role === 'friend' ? '+' : '-'}{Math.abs(r.ownPoints / 2)} pts para ti)
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Scoreboard */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Puntuación total</p>
        {[...sortedPlayers]
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 py-2 border-b border-rose-50 last:border-0">
              <span className="text-lg">{['🥇','🥈','🥉'][i] ?? '▪️'}</span>
              <span className="font-medium text-gray-700 flex-1">{p.name}</span>
              <span className="font-bold text-gray-800">{Math.round((p.score ?? 0) * 10) / 10}</span>
            </div>
          ))}
      </div>

      {isHost && (
        <button onClick={handleNext} className="btn-primary w-full text-lg">
          {isLastRound ? '🏆 Ver ganador final' : `Ronda ${game.round + 1} →`}
        </button>
      )}
      {!isHost && (
        <div className="card text-center py-3">
          <p className="text-sm text-gray-500">Esperando al host...</p>
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
