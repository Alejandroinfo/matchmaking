import { useState, useEffect } from 'react'
import { getAttributes, getPriorityPoints, getAttrOptions, ANTAGONISTS } from '../data/gameData'

const STATES = ['?', '✓', '✗']  // cycle: unknown → confirmed → ruled out

export default function PersonalNotes({ roomCode, playerId, game }) {
  const storageKey = `notes_${roomCode}_${playerId}`
  const gridKey    = `grid_${roomCode}_${playerId}`

  const numAttributes = game?.settings?.numAttributes ?? 4
  const numOptions    = game?.settings?.numOptions    ?? 6
  const attrs         = getAttributes(numAttributes)
  const pts           = getPriorityPoints(numAttributes)

  // Free-text notes
  const [notes, setNotes] = useState(() => localStorage.getItem(storageKey) ?? '')
  // Grid state: { [attrName]: { [optionValue]: '?' | '✓' | '✗' } }
  const [grid, setGrid] = useState(() => {
    try { return JSON.parse(localStorage.getItem(gridKey) ?? '{}') } catch { return {} }
  })
  const [tab, setTab]   = useState('grid')  // 'grid' | 'notes'
  const [open, setOpen] = useState(false)

  useEffect(() => { localStorage.setItem(storageKey, notes) }, [notes, storageKey])
  useEffect(() => { localStorage.setItem(gridKey, JSON.stringify(grid)) }, [grid, gridKey])

  function cycleCell(attrName, option) {
    setGrid(prev => {
      const attrState = prev[attrName] ?? {}
      const cur = attrState[option] ?? '?'
      const next = STATES[(STATES.indexOf(cur) + 1) % STATES.length]
      return { ...prev, [attrName]: { ...attrState, [option]: next } }
    })
  }

  function cellStyle(state) {
    if (state === '✓') return 'bg-emerald-100 text-emerald-700 border-emerald-300 font-bold'
    if (state === '✗') return 'bg-rose-50 text-rose-300 border-rose-200 line-through'
    return 'bg-gray-50 text-gray-400 border-gray-200'
  }

  return (
    <div className="card">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          📝 Mis pistas sobre mí
        </p>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {/* Tab selector */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[['grid','Deducción'], ['notes','Notas libres']].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  tab === t ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-400'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Grid tab */}
          {tab === 'grid' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Toca cada opción para marcar ✓ probable · ✗ descartada</p>
              {attrs.map((attr, i) => {
                const options = getAttrOptions(attr, numOptions)
                // Group into pairs (antagonists)
                const pairs = attr.pairs.slice(0, numOptions / 2)
                return (
                  <div key={attr.name}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded text-white ${
                        pts[i] === 3 ? 'bg-rose-500' :
                        pts[i] === 2 ? 'bg-pink-400' : 'bg-rose-200 text-rose-600'
                      }`}>{pts[i]}p</span>
                      <span className="text-xs font-semibold text-gray-600">{attr.emoji} {attr.name}</span>
                    </div>
                    <div className="space-y-1">
                      {pairs.map(([a, b]) => (
                        <div key={a} className="flex gap-1">
                          {[a, b].map(opt => {
                            const state = grid[attr.name]?.[opt] ?? '?'
                            return (
                              <button key={opt} onClick={() => cycleCell(attr.name, opt)}
                                className={`flex-1 text-xs py-1.5 px-2 rounded-lg border transition-all text-left ${cellStyle(state)}`}>
                                <span className="mr-1">{state}</span>{opt}
                              </button>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              <button onClick={() => setGrid({})}
                className="text-xs text-gray-400 hover:text-gray-600 w-full text-center pt-1">
                Resetear grid
              </button>
            </div>
          )}

          {/* Notes tab */}
          {tab === 'notes' && (
            <div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notas libres… pistas del pitch, patrones que notas, intuiciones…"
                rows={5}
                className="w-full text-xs text-gray-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-rose-300"
              />
              <p className="text-xs text-gray-400 mt-1">Solo tú ves esto — se guarda automáticamente</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
