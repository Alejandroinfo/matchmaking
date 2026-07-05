import { useState } from 'react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

// After reveal: vote for best matchmaker this round
// Winner gets +1 token
export default function VoteScreen({ roomCode, game, playerId, isHost, sortedPlayers, otherPlayers }) {
  const [vote, setVote] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const votes = game.matchmakerVotes ?? {}
  const whoVoted = Object.keys(votes)
  const allVoted = sortedPlayers.every(p => votes[p.id])

  async function handleVote() {
    if (!vote || submitted) return
    setLoading(true)
    await updateDoc(doc(db, 'games', roomCode), {
      [`matchmakerVotes.${playerId}`]: vote,
    })
    setSubmitted(true)
    setLoading(false)
  }

  async function handleRevealVotes() {
    // Count votes and award token to winner
    const tally = {}
    Object.values(votes).forEach(pid => { tally[pid] = (tally[pid] ?? 0) + 1 })
    const maxVotes = Math.max(...Object.values(tally))
    const winners = Object.keys(tally).filter(pid => tally[pid] === maxVotes)

    const updatedPlayers = { ...game.players }
    winners.forEach(pid => {
      updatedPlayers[pid] = { ...updatedPlayers[pid], tokens: (updatedPlayers[pid].tokens ?? 0) + 1 }
    })

    await updateDoc(doc(db, 'games', roomCode), {
      phase: 'reveal',
      players: updatedPlayers,
      matchmakerWinners: winners,
      matchmakerTally: tally,
    })
  }

  return (
    <div className="min-h-screen p-4 max-w-sm mx-auto space-y-4">
      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda {game.round} · Voto</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">¿Mejor matchmaker? 🏆</h2>
        <p className="text-sm text-gray-500 mt-1">El más votado gana +1 🪙</p>
      </div>

      {/* Progress */}
      <div className="card flex items-center gap-2 py-2 flex-wrap">
        <span className="text-xs text-gray-500">Votaron:</span>
        {sortedPlayers.map(p => (
          <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            whoVoted.includes(p.id) ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {whoVoted.includes(p.id) ? '✓' : '⏳'} {p.name.split(' ')[0]}
          </span>
        ))}
      </div>

      {/* Vote — can't vote for yourself */}
      {!submitted ? (
        <div className="card space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu voto (no puedes votarte)</p>
          {otherPlayers.map(p => (
            <button
              key={p.id}
              onClick={() => setVote(p.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                vote === p.id ? 'border-rose-400 bg-rose-50' : 'border-rose-100 bg-white hover:border-rose-300'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-500">
                {p.name.charAt(0)}
              </div>
              <span className="font-medium text-gray-700">{p.name}</span>
              {vote === p.id && <span className="ml-auto text-rose-500">🏆</span>}
            </button>
          ))}
          <button
            onClick={handleVote}
            disabled={!vote || loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? '...' : 'Votar'}
          </button>
        </div>
      ) : (
        <div className="card text-center py-4">
          <p className="text-emerald-600 font-semibold">✓ Voto enviado</p>
          <p className="text-xs text-gray-400 mt-1">Esperando a los demás...</p>
          <div className="flex justify-center gap-1 mt-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Host reveals when all voted */}
      {isHost && allVoted && (
        <button onClick={handleRevealVotes} className="btn-primary w-full">
          Revelar resultados y continuar →
        </button>
      )}
      <div className="h-4" />
    </div>
  )
}
