import { useNavigate } from 'react-router-dom'
import { getRoleLabel, getRoleColor } from '../logic/gameLogic'
import PersonalityPanel from '../components/PersonalityPanel'

export default function EndScreen({ game, playerId, sortedPlayers, myRoles, myPersonality }) {
  const navigate = useNavigate()
  const ranked = [...sortedPlayers].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const winner = ranked[0]
  const personalities = game.personalities ?? {}
  const isMe = winner?.id === playerId
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      {/* Winner */}
      <div className="card text-center py-6 border-amber-200 bg-amber-50">
        <div className="text-5xl mb-2">🏆</div>
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Ganador/a</p>
        <h2 className="text-2xl font-bold text-gray-800 mt-1">
          {winner?.name} {isMe && '🎉'}
        </h2>
        <p className="text-amber-600 font-bold text-xl mt-1">{Math.round((winner?.score ?? 0) * 10) / 10} puntos</p>
        {isMe && <p className="text-sm text-gray-500 mt-2">¡Has ganado! Tu intuición fue la mejor 💘</p>}
      </div>

      {/* Full ranking */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Clasificación final</p>
        {ranked.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-3 py-2.5 border-b border-rose-50 last:border-0 ${p.id === playerId ? 'bg-rose-50 -mx-4 px-4' : ''}`}>
            <span className="text-xl w-8">{medals[i] ?? `${i+1}.`}</span>
            <span className="font-medium text-gray-700 flex-1">{p.name} {p.id === playerId && <span className="text-xs text-rose-400">(tú)</span>}</span>
            <span className="font-bold text-gray-800">{Math.round((p.score ?? 0) * 10) / 10} pts</span>
          </div>
        ))}
      </div>

      {/* Reveal your own personality */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu personalidad real</p>
        <p className="text-xs text-gray-400 mb-3">Esto es lo que buscabas en una pareja, en orden de prioridad:</p>
        <PersonalityPanel personality={myPersonality} showValues showPriority />
      </div>

      {/* Reveal roles */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tus roles revelados</p>
        <div className="space-y-2">
          {sortedPlayers.filter(p => p.id !== playerId).map(p => {
            const role = myRoles[p.id]
            return (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{p.name}</span>
                {role && (
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getRoleColor(role)}`}>
                    {getRoleLabel(role)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* All personalities */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Personalidades de todos</p>
        <div className="space-y-4">
          {sortedPlayers.map(p => (
            <div key={p.id}>
              <p className="text-sm font-semibold text-gray-700 mb-1">{p.name} {p.id === playerId && '(tú)'}</p>
              <PersonalityPanel personality={personalities[p.id] ?? []} showValues showPriority compact />
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => navigate('/')} className="btn-primary w-full">
        Jugar otra vez 💘
      </button>

      <div className="h-4" />
    </div>
  )
}
