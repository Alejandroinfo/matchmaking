import { useState } from 'react'
import { submitSelection } from '../services/gameService'
import { ALL_POSTORS } from '../data/gameData'
import { getRoleLabel, getRoleColor } from '../logic/gameLogic'
import PostorCard from '../components/PostorCard'
import PersonalityPanel from '../components/PersonalityPanel'
import AntagonistTable from '../components/AntagonistTable'

export default function SelectionScreen({
  roomCode, game, playerId, mySelection, myRoles, otherPlayers, sortedPlayers
}) {
  const [selected, setSelected] = useState(mySelection)
  const [confirmed, setConfirmed] = useState(mySelection != null)
  const [loading, setLoading] = useState(false)
  const [showAntagonists, setShowAntagonists] = useState(false)

  const deployedPostors = (game.deployedPostors ?? []).map(id => ALL_POSTORS[id])
  const recommendations = game.recommendations ?? {}
  const selections = game.selections ?? {}
  const personalities = game.personalities ?? {}

  // Who recommended what to me
  const recsForMe = otherPlayers
    .filter(p => recommendations[p.id]?.[playerId] != null)
    .map(p => ({ player: p, postorId: recommendations[p.id][playerId] }))

  const whoSelected = Object.keys(selections).filter(pid => selections[pid] != null)

  async function handleConfirm() {
    if (selected == null || confirmed) return
    setLoading(true)
    try {
      await submitSelection(roomCode, playerId, selected)
      setConfirmed(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      {/* Header */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Elige</p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">¿Con quién te quedas?</h2>
      </div>

      {/* Who has selected */}
      <div className="card flex items-center gap-2 py-3 flex-wrap">
        <span className="text-xs text-gray-500">Han elegido:</span>
        {sortedPlayers.map(p => {
          const done = whoSelected.includes(p.id)
          return (
            <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {done ? '✓' : '⏳'} {p.name.split(' ')[0]}
            </span>
          )
        })}
      </div>

      {/* Other players personalities + my roles */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Personalidades</p>
        <div className="space-y-3">
          {otherPlayers.map(p => {
            const personality = personalities[p.id] ?? []
            const role = myRoles[p.id]
            return (
              <div key={p.id} className="border-b border-rose-50 last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500">
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{p.name}</span>
                  </div>
                  {role && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(role)}`}>
                      {getRoleLabel(role)}
                    </span>
                  )}
                </div>
                <PersonalityPanel personality={personality} showValues compact />
              </div>
            )
          })}
        </div>
      </div>

      {/* Antagonist reference toggle */}
      <button
        onClick={() => setShowAntagonists(v => !v)}
        className="btn-secondary w-full text-sm"
      >
        {showAntagonists ? '▲ Ocultar opuestos' : '▼ Ver tabla de opuestos'}
      </button>
      {showAntagonists && <AntagonistTable />}

      {/* Recommendations for me */}
      {recsForMe.length > 0 && (
        <div className="card">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Te recomiendan</p>
          <div className="space-y-1.5">
            {recsForMe.map(({ player, postorId }) => {
              const postor = ALL_POSTORS[postorId]
              const role = myRoles[player.id]
              return (
                <button
                  key={player.id}
                  onClick={() => !confirmed && setSelected(postorId)}
                  className={`w-full text-left flex items-center gap-2 p-2 rounded-xl border transition-all ${
                    selected === postorId ? 'border-rose-400 bg-rose-50' : 'border-rose-100 hover:border-rose-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500 flex-shrink-0">
                    {player.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">
                      {player.name.split(' ')[0]}
                      {role && <span className={`ml-1 px-1.5 py-0.5 rounded-full ${getRoleColor(role)}`}>{getRoleLabel(role)}</span>}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{postor.name}</p>
                  </div>
                  {selected === postorId && <span className="text-rose-500">💘</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* All postors grid — free selection */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Todos los postores — elige libremente
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {deployedPostors.map(postor => {
            const isRecommended = recsForMe.some(r => r.postorId === postor.id)
            return (
              <PostorCard
                key={postor.id}
                postor={postor}
                selected={selected === postor.id}
                onClick={() => !confirmed && setSelected(postor.id)}
                disabled={confirmed}
                highlighted={isRecommended}
                mini
              />
            )
          })}
        </div>
      </div>

      {/* Confirm button */}
      {!confirmed ? (
        <button
          onClick={handleConfirm}
          disabled={selected == null || loading}
          className="btn-primary w-full sticky bottom-4"
        >
          {loading ? 'Confirmando...' : selected != null
            ? `💘 Elegir a ${ALL_POSTORS[selected]?.name}`
            : 'Selecciona un postor'}
        </button>
      ) : (
        <div className="card text-center py-4">
          <p className="text-emerald-600 font-semibold">✓ Elección confirmada</p>
          <p className="text-sm text-gray-500 mt-1">Has elegido a <strong>{ALL_POSTORS[selected]?.name}</strong></p>
          <p className="text-xs text-gray-400 mt-2">Esperando a los demás...</p>
          <div className="flex justify-center gap-1 mt-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
