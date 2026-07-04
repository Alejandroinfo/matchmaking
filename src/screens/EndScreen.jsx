import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoleLabel, getRoleColor } from '../logic/gameLogic'
import { ALL_POSTORS } from '../data/gameData'
import { startGame } from '../services/gameService'
import PersonalityPanel from '../components/PersonalityPanel'

export default function EndScreen({ game, playerId, sortedPlayers, myRoles, myPersonality, roomCode, isHost }) {
  const navigate = useNavigate()
  const [rematching, setRematching] = useState(false)

  async function handleRematch() {
    setRematching(true)
    try {
      await startGame(roomCode)
    } finally {
      setRematching(false)
    }
  }
  const ranked = [...sortedPlayers].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const winner = ranked[0]
  const isMe = winner?.id === playerId
  const medals = ['🥇', '🥈', '🥉']
  const personalities = game.personalities ?? {}
  const roundHistory = game.roundHistory ?? []
  const soulmateResults = game.soulmateResults ?? {}
  const soulmateSelections = game.soulmateSelections ?? {}
  const roles = game.roles ?? {}

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-4">

      {/* Winner */}
      <div className="card text-center py-6 border-amber-200 bg-amber-50">
        <div className="text-5xl mb-2">🏆</div>
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Ganador/a</p>
        <h2 className="text-2xl font-bold text-gray-800 mt-1">
          {winner?.name} {isMe && '🎉'}
        </h2>
        <p className="text-amber-600 font-bold text-xl mt-1">{Math.round((winner?.score ?? 0) * 10) / 10} puntos</p>
      </div>

      {/* Final ranking */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Clasificación final</p>
        {ranked.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-3 py-2.5 border-b border-rose-50 last:border-0 ${p.id === playerId ? 'bg-rose-50 -mx-4 px-4 rounded-xl' : ''}`}>
            <span className="text-xl w-8">{medals[i] ?? `${i+1}.`}</span>
            <span className="font-medium text-gray-700 flex-1">{p.name} {p.id === playerId && <span className="text-xs text-rose-400">(tú)</span>}</span>
            <span className="font-bold text-gray-800">{Math.round((p.score ?? 0) * 10) / 10} pts</span>
          </div>
        ))}
      </div>

      {/* Per-player detailed breakdown */}
      {sortedPlayers.map(p => {
        const isMe = p.id === playerId
        const myRolesForP = roles[playerId] ?? {}
        const roleForP = myRolesForP[p.id]
        const soulmateR = soulmateResults[p.id]
        const soulmatePostor = soulmateR ? ALL_POSTORS[soulmateR.postorId] : null

        return (
          <div key={p.id} className={`card space-y-3 ${isMe ? 'border-rose-300' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-500">
                {p.name.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-800">{p.name} {isMe && '(tú)'}</h3>
              {!isMe && roleForP && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(roleForP)}`}>
                  {getRoleLabel(roleForP)}
                </span>
              )}
            </div>

            {/* Personality */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Personalidad real</p>
              <PersonalityPanel personality={personalities[p.id] ?? []} showValues compact />
            </div>

            {/* Round history */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Citas por ronda</p>
              <div className="space-y-1">
                {roundHistory.map(({ round, results }) => {
                  const r = results?.[p.id]
                  if (!r) return null
                  const postor = ALL_POSTORS[r.postorId]
                  return (
                    <div key={round} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 text-sm">
                      <span className="text-xs font-bold text-gray-400 w-14">Ronda {round}</span>
                      <span className="text-gray-700 flex-1 truncate">{postor?.name}</span>
                      <span className="text-rose-500 font-medium">{r.matches} ✨</span>
                      <span className="font-bold text-gray-700 w-14 text-right">{r.ownPoints > 0 ? '+' : ''}{r.ownPoints} pts</span>
                      {isMe && r.rolePoints !== 0 && (
                        <span className={`text-xs font-medium w-20 text-right ${r.rolePoints > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          rol: {r.rolePoints > 0 ? '+' : ''}{r.rolePoints}
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Soulmate row */}
                {soulmateR && (
                  <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-3 py-2 text-sm border border-rose-200">
                    <span className="text-xs font-bold text-rose-400 w-14">💞 Soul</span>
                    <span className="text-gray-700 flex-1 truncate">{soulmatePostor?.name}</span>
                    <span className="text-rose-500 font-medium">{soulmateR.matches} ✨</span>
                    <span className="font-bold text-gray-700 w-14 text-right">{soulmateR.ownPoints > 0 ? '+' : ''}{soulmateR.ownPoints} pts</span>
                  </div>
                )}
              </div>
            </div>

            {/* Role points breakdown (my view of others) */}
            {isMe && roundHistory.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Puntos por roles</p>
                <div className="space-y-1">
                  {sortedPlayers.filter(q => q.id !== playerId).map(q => {
                    const role = myRolesForP[q.id]
                    const totalRoleImpact = roundHistory.reduce((acc, { results }) => {
                      const r = results?.[q.id]
                      if (!r || !role || role === 'neutral') return acc
                      return acc + (role === 'friend' ? r.ownPoints / 2 : -r.ownPoints / 2)
                    }, 0)
                    const rounded = Math.round(totalRoleImpact * 10) / 10
                    return (
                      <div key={q.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">
                          {q.name.charAt(0)}
                        </div>
                        <span className="text-gray-700 flex-1">{q.name}</span>
                        {role && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(role)}`}>{getRoleLabel(role)}</span>}
                        <span className={`font-bold ${rounded > 0 ? 'text-emerald-600' : rounded < 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                          {rounded > 0 ? '+' : ''}{rounded} pts
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div className="flex gap-3">
        {isHost && (
          <button onClick={handleRematch} disabled={rematching} className="btn-primary flex-1">
            {rematching ? '...' : '🔄 Revancha'}
          </button>
        )}
        <button onClick={() => navigate('/')} className={`${isHost ? 'btn-secondary flex-1' : 'btn-primary w-full'}`}>
          Nuevo juego 💘
        </button>
      </div>
      <div className="h-4" />
    </div>
  )
}
