import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRoom, joinRoom } from '../services/gameService'

export default function HomeScreen() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('create')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
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

  async function handleJoin() {
    if (!name.trim()) return setError('Ingresa tu nombre')
    if (!code.trim()) return setError('Ingresa el código de la sala')
    setLoading(true)
    try {
      await joinRoom(code.trim().toUpperCase(), name.trim())
      navigate(`/room/${code.trim().toUpperCase()}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💘</div>
          <h1 className="text-3xl font-bold text-gray-800">Matchmaker</h1>
          <p className="text-gray-500 mt-1 text-sm">Descubre quién eres a través del amor</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-rose-50 rounded-2xl p-1 mb-6">
          {['create', 'join'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? 'bg-white text-rose-500 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t === 'create' ? '✨ Crear sala' : '🚪 Unirse'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="card space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu nombre</label>
            <input
              className="input mt-1"
              placeholder="¿Cómo te llamas?"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
            />
          </div>

          {tab === 'join' && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Código de sala</label>
              <input
                className="input mt-1 uppercase tracking-widest font-mono text-lg"
                placeholder="XXXXX"
                value={code}
                maxLength={5}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
            </div>
          )}

          {error && (
            <p className="text-rose-500 text-sm bg-rose-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            onClick={tab === 'create' ? handleCreate : handleJoin}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '...' : tab === 'create' ? 'Crear sala' : 'Unirse a la sala'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Comparte el código con tus amigos para que puedan unirse
        </p>
      </div>
    </div>
  )
}
