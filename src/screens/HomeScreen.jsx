import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createRoom, joinRoom } from '../services/gameService'

// Used when visiting / directly
export function HomeScreen() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return setError('Ingresa tu nombre')
    setLoading(true)
    try {
      const { roomCode } = await createRoom(name.trim(), {})
      navigate(`/room/${roomCode}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💘</div>
          <h1 className="text-3xl font-bold text-gray-800">Matchmaker</h1>
          <p className="text-gray-500 mt-1 text-sm">Descubre quién eres a través del amor</p>
        </div>
        <div className="card space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu nombre</label>
            <input
              className="input mt-1"
              placeholder="¿Cómo te llamas?"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          {error && <p className="text-rose-500 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>}
          <button onClick={handleCreate} disabled={loading} className="btn-primary w-full">
            {loading ? '...' : '✨ Crear sala'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          ¿Te han enviado un link? Ábrelo directamente para unirte
        </p>
      </div>
    </div>
  )
}

// Used when visiting /room/:roomCode directly (joining via link)
export function JoinScreen() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    if (!name.trim()) return setError('Ingresa tu nombre')
    setLoading(true)
    try {
      await joinRoom(roomCode, name.trim())
      // Don't navigate — they're already on /room/:roomCode
      // GameRoom will pick up the state change via Firebase
    } catch (e) {
      // If already in the room (same playerId), just proceed
      if (e.message !== 'La partida ya ha comenzado') {
        // ignore duplicate join errors silently
      }
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💘</div>
          <h1 className="text-3xl font-bold text-gray-800">Matchmaker</h1>
          <p className="text-gray-500 mt-1 text-sm">Te han invitado a una sala</p>
        </div>
        <div className="card space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu nombre</label>
            <input
              className="input mt-1"
              placeholder="¿Cómo te llamas?"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
          </div>
          {error && <p className="text-rose-500 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>}
          <button onClick={handleJoin} disabled={loading} className="btn-primary w-full">
            {loading ? '...' : '🚪 Unirse a la sala'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
