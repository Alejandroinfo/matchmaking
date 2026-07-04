import { useState } from 'react'
import { submitSelection } from '../services/gameService'
import { ALL_POSTORS } from '../data/gameData'
import { getRoleLabel, getRoleColor } from '../logic/gameLogic'
import PostorCard from '../components/PostorCard'
import PersonalityPanel from '../components/PersonalityPanel'
import AntagonistTable from '../components/AntagonistTable'
import MatchHistory from '../components/MatchHistory'

export default function SelectionScreen({
  roomCode, game, playerId, mySelection, myRoles, myHand, otherPlayers, sortedPlayers, roundHistory
}) {
  const [selected, setSelected] = useState(mySelection)
  const [confirmed, setConfirmed] = useState(mySelection != null)
  const [loading, setLoading] = useState(false)
  const [showAntagonists, setShowAntagonists] = useState(false)

  const recommendations = game.recommendations ?? {}
  const selections = game.selections ?? {}
  const personalities = game.personalities ?? {}

  // Recommendations received
  const recsForMe = otherPlayers
    .filter(p => recommendations[p.id]?.[playerId] != null)
    .map(p => ({ player: p, postorId: recommendations[p.id][playerId] }))

  // Remaining hand: cards NOT used in my recommendations
  const myUsedIds = new Set(
    Object.values(recommendations[playerId] ?? {})
  )
  const remainingHand = myHand.filter(id => !myUsedIds.has(id)).map(id => ALL_POSTORS[id])

  // All selectable options: recommendations + remaining hand (deduped)
  const recPostorIds = new Set(recsForMe.map(r => r.postorId))
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
    <div className="min-h-screen p-4 max-w-5xl mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Elige</p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">¿Con quién te quedas?</h2>
      </div>

      {/* Who has selected */}
      <div className="card flex items-center gap-2 py-2 flex-wrap">
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

      <div className="flex flex-col lg:flex-row gap-4">

        {/* LEFT: others' personalities + history */}
        <div className="lg:w-72 xl:w-80 flex-shrink-0 space-y-4">
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

          {roundHistory.length > 0 && (
            <MatchHistory roundHistory={roundHistory} playerId={playerId} />
          )}

          <button onClick={() => setShowAntagonists(v => !v)} className="btn-secondary w-full text-sm">
            {showAntagonists ? '▲ Ocultar opuestos' : '▼ Ver tabla de opuestos'}
          </button>
          {showAntagonists && <AntagonistTable />}
        </div>

        {/* RIGHT: options */}
        <div className="flex-1 space-y-4">

          {/* Recommendations received */}
          {recsForMe.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Te recomiendan ({recsForMe.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {recsForMe.map(({ player, postorId }) => {
                  const postor = ALL_POSTORS[postorId]
                  const role = myRoles[player.id]
                  return (
                    <PostorCard
                      key={`rec-${player.id}`}
                      postor={postor}
                      selected={selected === postorId}
                      onClick={() => !confirmed && setSelected(postorId)}
                      disabled={confirmed}
                      highlighted
                      badge={`💌 ${player.name.split(' ')[0]}`}
                      mini
                    />
                  )
                })}
              </div>
            </div>
          )}

          {/* Remaining hand */}
          {remainingHand.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Tu mano restante ({remainingHand.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {remainingHand.map(postor => (
                  <PostorCard
                    key={`hand-${postor.id}`}
                    postor={postor}
                    selected={selected === postor.id}
                    onClick={() => !confirmed && setSelected(postor.id)}
                    disabled={confirmed}
                    mini
                  />
                ))}
              </div>
            </div>
          )}

          {/* Confirm */}
          {!confirmed ? (
            <button onClick={handleConfirm} disabled={selected == null || loading} className="btn-primary w-full sticky bottom-4">
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
        </div>
      </div>
      <div className="h-4" />
    </div>
  )
}
