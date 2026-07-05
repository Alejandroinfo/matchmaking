import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startGame } from '../services/gameService'
import { ANTAGONISTS, getAttributes } from '../data/gameData'
import PersonalityPanel from '../components/PersonalityPanel'

export default function EndScreen({ game, playerId, sortedPlayers, myPersonality, roomCode, isHost }) {
  const navigate = useNavigate()
  const [rematching, setRematching] = useState(false)

  const ranked = [...sortedPlayers].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const winner = ranked[0]
  const personalities = game.personalities ?? {}
  const soulmateResults = game.soulmateResults ?? {}
  const roundHistory = game.roundHistory ?? []
  const numAttributes = game.settings?.numAttributes ?? 4
  const attrs = getAttributes(numAttributes)

  async function handleRematch() {
    setRematching(true)
    try { await startGame(roomCode) }
    finally { setRematching(false) }
  }

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto space-y-4">
      {/* Winner */}
      <div className="card text-center py-6 border-amber-200 bg-amber-50">
        <div className="text-5xl mb-2">🏆</div>
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Ganador/a</p>
        <h2 className="text-2xl font-bold text-gray-800 mt-1">{winner?.name} {winner?.id === playerId && '🎉'}</h2>
        <p className="text-amber-600 font-bold text-xl mt-1">{Math.round((winner?.score ?? 0) * 10) / 10} pts</p>
      </div>

      {/* Ranking */}
      <div className="card">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Clasificación final</p>
        {ranked.map((p, i) => {
          const soulmateR = soulmateResults[p.id]
          const finalTokens = p.tokens ?? 0
          const soulmatePoints = soulmateR?.ownPoints ?? 0
          return (
            <div key={p.id} className={`py-2.5 border-b border-rose-50 last:border-0 ${p.id === playerId ? 'bg-rose-50 -mx-4 px-4 rounded-xl' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl w-8">{['🥇','🥈','🥉'][i] ?? `${i+1}.`}</span>
                <span className="font-medium text-gray-700 flex-1">{p.name} {p.id === playerId && <span className="text-xs text-rose-400">(tú)</span>}</span>
                <span className="font-bold text-gray-800">{Math.round((p.score ?? 0) * 10) / 10} pts</span>
              </div>
              <div className="flex gap-3 mt-1 ml-11 text-xs text-gray-500">
                <span>🪙 {finalTokens} tokens</span>
                <span>+ 💞 {soulmatePoints > 0 ? '+' : ''}{soulmatePoints} soulmate</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Per-player breakdown */}
      {sortedPlayers.map(p => {
        const isMe = p.id === playerId
        const soulmateR = soulmateResults[p.id]
        const allDates = roundHistory.flatMap(({ round, results }) =>
          (results?.[p.id]?.acceptedDates ?? []).map(d => ({ round, ...d }))
        )
        const tokenHistory = roundHistory.map(({ round, tokenChanges }) => ({
          round, change: tokenChanges?.[p.id] ?? 0
        }))

        return (
          <div key={p.id} className={`card space-y-3 ${isMe ? 'border-rose-300' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-500">
                {p.name.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-800">{p.name} {isMe && '(tú)'}</h3>
              <span className="ml-auto font-bold text-gray-700">{p.tokens ?? 0} 🪙</span>
            </div>

            {/* Real personality */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Personalidad real</p>
              <PersonalityPanel personality={personalities[p.id] ?? []} showValues />
            </div>

            {/* Token history per round */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tokens por ronda</p>
              <div className="flex gap-2">
                {tokenHistory.map(({ round, change }) => (
                  <div key={round} className={`flex-1 rounded-xl px-2 py-2 text-center text-xs font-bold ${
                    change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <div className="text-gray-500 font-normal mb-0.5">R{round}</div>
                    <div className="text-emerald-600">+3 🪙</div>
                    <div className={change - 3 >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                      {change - 3 >= 0 ? '+' : ''}{change - 3} citas
                    </div>
                    <div className="font-bold mt-0.5">{change >= 0 ? '+' : ''}{change} net</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Soulmate breakdown */}
            {soulmateR && (
              <div className="bg-rose-50 rounded-xl p-3 border border-rose-200">
                <p className="text-xs font-bold text-rose-400 mb-2">💞 Soulmate ×2 — ¿Cuánto me conozco?</p>
                <div className="space-y-1">
                  {attrs.map(attr => {
                    const guessed = soulmateR.description?.[attr.name]
                    const real = (personalities[p.id] ?? []).find(c => c.attribute === attr.name)?.value
                    const correct = guessed === real
                    const isAntagonist = guessed && real && guessed === ANTAGONISTS[real]
                    return (
                      <div key={attr.name} className="flex items-center gap-2 text-xs">
                        <span>{attr.emoji}</span>
                        <span className="text-gray-500 w-20 flex-shrink-0">{attr.name}</span>
                        <span className={`font-semibold ${correct ? 'text-emerald-600' : isAntagonist ? 'text-red-500' : 'text-gray-500'}`}>
                          {guessed ?? '?'}
                        </span>
                        {!correct && real && (
                          <span className="text-gray-400">→ <strong>{real}</strong></span>
                        )}
                        <span className="ml-auto">{correct ? '✓ +pts' : isAntagonist ? '✗✗ -pts' : '✗ 0'}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 text-right font-bold text-sm">
                  <span className={soulmateR.ownPoints >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                    {soulmateR.ownPoints > 0 ? '+' : ''}{soulmateR.ownPoints} pts ({soulmateR.matches} correctos)
                  </span>
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
        <button onClick={() => navigate('/')} className={isHost ? 'btn-secondary flex-1' : 'btn-primary w-full'}>
          Nuevo juego 💘
        </button>
      </div>
      <div className="h-4" />
    </div>
  )
}
