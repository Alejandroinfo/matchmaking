import { useState } from 'react'
import { startGame, updateSettings } from '../services/gameService'

const LAST_SETTINGS_KEY = 'blindspot_last_settings'

export default function LobbyScreen({ roomCode, game, playerId, isHost, sortedPlayers }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const settings = game.settings

  async function handleStart() {
    if (sortedPlayers.length < 2) return setError('Necesitas al menos 2 jugadores')
    // Save settings for next time
    localStorage.setItem(LAST_SETTINGS_KEY, JSON.stringify(settings))
    setLoading(true)
    try {
      await startGame(roomCode)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSetting(key, val) {
    await updateSettings(roomCode, { ...settings, [key]: val })
  }

  async function handleLoadLastSettings() {
    try {
      const saved = localStorage.getItem(LAST_SETTINGS_KEY)
      if (!saved) return
      const last = JSON.parse(saved)
      await updateSettings(roomCode, { ...settings, ...last })
    } catch {}
  }

  const hasLastSettings = !!localStorage.getItem(LAST_SETTINGS_KEY)

  const n = sortedPlayers.length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2">💘</div>
          <h1 className="text-2xl font-bold text-gray-800">Sala de espera</h1>
          <div className="mt-2 flex items-center gap-2 bg-white rounded-2xl px-4 py-2 border border-rose-100 shadow-sm">
            <span className="text-xs text-gray-500 flex-shrink-0">Link:</span>
            <span className="text-xs text-rose-500 truncate flex-1">{window.location.href}</span>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="text-xs text-gray-400 hover:text-rose-400 flex-shrink-0"
            >📋 Copiar</button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Comparte este link con tus amigos</p>
        </div>

        {/* Players */}
        <div className="card">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Jugadores ({sortedPlayers.length})
          </h2>
          <div className="space-y-2">
            {sortedPlayers.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-rose-50 last:border-0">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-700">{p.name}</span>
                {p.id === game.hostId && (
                  <span className="ml-auto text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">Host</span>
                )}
                {p.id === playerId && p.id !== game.hostId && (
                  <span className="ml-auto text-xs bg-rose-50 text-rose-400 px-2 py-0.5 rounded-full">Tú</span>
                )}
              </div>
            ))}
            {sortedPlayers.length < 6 && (
              <p className="text-xs text-gray-400 text-center pt-1">Esperando jugadores...</p>
            )}
          </div>
          {n >= 3 && (
            <p className="text-xs text-gray-400 mt-3 text-center bg-rose-50 rounded-xl px-3 py-2">
              {ROLE_DIST[Math.min(n, 6)]} por jugador
            </p>
          )}
        </div>

        {/* Settings (host only) */}
        {isHost && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Configuración</h2>
              {hasLastSettings && isHost && (
                <button onClick={handleLoadLastSettings}
                  className="text-xs text-rose-500 font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-1 rounded-lg transition-all">
                  ⚡ Usar anterior
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 font-medium">Rondas</label>
                <div className="flex gap-2 mt-1">
                  {[2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => handleSetting('totalRounds', n)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        settings.totalRounds === n ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                      }`}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Eventos de ronda</label>
                <div className="flex gap-2 mt-1">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => handleSetting('enableEvents', v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        settings.enableEvents === v ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                      }`}>
                      {v ? '✓ Activados' : '✗ Desactivados'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {settings.enableEvents ? 'Cada ronda se activa un evento aleatorio' : 'Sin eventos — juego base'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Modo de reveal de citas</label>
                <div className="flex gap-2 mt-1">
                  {[['matches','Mostrar matches'], ['points','Mostrar puntos']].map(([v, label]) => (
                    <button key={v} onClick={() => handleSetting('revealMode', v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        settings.revealMode === v ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {settings.revealMode === 'points'
                    ? 'Revela el total de puntos de citas, sin mostrar matches individuales'
                    : 'Muestra matches totales, oculta puntos (default)'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Apuesta de matches</label>
                <div className="flex gap-2 mt-1">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => handleSetting('enableBetting', v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        settings.enableBetting === v ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                      }`}>
                      {v ? '✓ Activada' : '✗ Desactivada'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {settings.enableBetting ? 'Declara tus matches antes del reveal: acierta y recuperas 1🪙 de los tuyos' : 'Sin apuesta — pasa directo al reveal'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Atributos por jugador</label>
                <div className="flex gap-2 mt-1">
                  {[4, 5, 6].map(n => (
                    <button key={n} onClick={() => handleSetting('numAttributes', n)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        settings.numAttributes === n ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                      }`}>
                      {n} atributos
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {settings.numAttributes === 6 ? '6 atributos (3,3,2,2,1,1) — añade Humor. Experimental' :
                   settings.numAttributes === 5 ? 'Añade Intereses (Arte↔Ciencia, Naturaleza↔Ciudad, Música↔Silencio)' :
                   '4 atributos — configuración base'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Tiempo de pitch</label>
                <div className="flex gap-2 mt-1">
                  {[60, 90, 120].map(n => (
                    <button key={n} onClick={() => handleSetting('pitchTime', n)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        settings.pitchTime === n ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                      }`}>
                      {n}s
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Tiempo para convencer antes del swipe</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Opciones por atributo</label>
                <div className="flex gap-2 mt-1">
                  {[4, 6].map(n => (
                    <button key={n} onClick={() => handleSetting('numOptions', n)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        settings.numOptions === n ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-600 border-rose-100 hover:border-rose-300'
                      }`}>
                      {n} opciones
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {settings.numOptions === 4 ? '2 pares de opuestos — más fácil de deducir' : '3 pares de opuestos — más variedad'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isHost && (
          <div className="card text-center">
            <p className="text-sm text-gray-500">Esperando que el host comience el juego...</p>
            <div className="flex justify-center gap-1 mt-2">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {isHost && (
          <>
            {error && <p className="text-rose-500 text-sm text-center">{error}</p>}
            <button
              onClick={handleStart}
              disabled={loading || sortedPlayers.length < 2}
              className="btn-primary w-full text-lg"
            >
              {loading ? 'Iniciando...' : '¡Comenzar el juego! 💘'}
            </button>
            {sortedPlayers.length < 2 && (
              <p className="text-center text-xs text-gray-400">Necesitas al menos 2 jugadores</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
