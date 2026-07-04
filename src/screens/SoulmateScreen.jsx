import { useState } from 'react'
import { submitSoulmateSelection } from '../services/gameService'
import { ATTRIBUTES, ANTAGONISTS, getAttrOptions } from '../data/gameData'

export default function SoulmateScreen({ roomCode, game, playerId, sortedPlayers }) {
  const numOptions = game.settings?.numOptions ?? 6
  const soulmateSelections = game.soulmateSelections ?? {}
  const whoConfirmed = Object.keys(soulmateSelections)

  // description: { [attributeName]: value }
  const [description, setDescription] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const allPicked = ATTRIBUTES.every(attr => description[attr.name] != null)

  function pick(attrName, value) {
    if (submitted) return
    setDescription(prev => ({ ...prev, [attrName]: value }))
  }

  async function handleSubmit() {
    if (!allPicked || submitted) return
    setLoading(true)
    try {
      await submitSoulmateSelection(roomCode, playerId, description)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto space-y-4">
      <div className="text-center pt-2">
        <div className="text-4xl mb-1">💞</div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Ronda final · Soulmate</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">Describe a tu pareja ideal</h2>
        <p className="text-sm text-gray-500 mt-1">
          Elige lo que buscas en cada atributo.<br />
          <span className="text-rose-500 font-medium">Cada atributo que aciertes vale el doble de puntos. ×2</span>
        </p>
      </div>

      {/* Who confirmed */}
      <div className="card flex items-center gap-2 py-2 flex-wrap">
        <span className="text-xs text-gray-500">Listos:</span>
        {sortedPlayers.map(p => {
          const done = whoConfirmed.includes(p.id)
          return (
            <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
              {done ? '✓' : '⏳'} {p.name.split(' ')[0]}
            </span>
          )
        })}
      </div>

      {/* Attribute pickers */}
      <div className="space-y-4">
        {ATTRIBUTES.map(attr => {
          const options = getAttrOptions(attr, numOptions)
          const selected = description[attr.name]
          return (
            <div key={attr.name} className="card">
              <p className="text-sm font-bold text-gray-700 mb-3">
                {attr.emoji} {attr.name}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {options.map(opt => {
                  const isSelected = selected === opt
                  const antagonist = ANTAGONISTS[opt]
                  const isPair = options.find(o => o === ANTAGONISTS[opt])
                  return (
                    <button
                      key={opt}
                      onClick={() => pick(attr.name, opt)}
                      disabled={submitted}
                      className={`p-3 rounded-xl text-sm font-semibold border transition-all text-left ${
                        isSelected
                          ? 'border-rose-400 bg-rose-50 text-rose-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-rose-200'
                      }`}
                    >
                      <span>{opt}</span>
                      {antagonist && isPair && (
                        <span className="block text-xs text-red-400 font-normal mt-0.5">≠ {antagonist}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary preview */}
      {Object.keys(description).length > 0 && (
        <div className="card bg-rose-50 border-rose-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tu descripción</p>
          <div className="space-y-1">
            {ATTRIBUTES.filter(a => description[a.name]).map(attr => (
              <div key={attr.name} className="flex items-center gap-2 text-sm">
                <span>{attr.emoji}</span>
                <span className="text-gray-500">{attr.name}:</span>
                <span className="font-semibold text-gray-800">{description[attr.name]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!submitted ? (
        <button onClick={handleSubmit} disabled={!allPicked || loading} className="btn-primary w-full text-lg sticky bottom-4">
          {loading ? '...' : allPicked ? '💞 Esta es mi pareja ideal' : `Faltan ${ATTRIBUTES.filter(a => !description[a.name]).length} atributos`}
        </button>
      ) : (
        <div className="card text-center py-6">
          <div className="text-3xl mb-2">💞</div>
          <p className="text-emerald-600 font-bold">¡Descripción enviada!</p>
          <p className="text-xs text-gray-400 mt-2">Esperando a los demás para ver si te conoces bien...</p>
          <div className="flex justify-center gap-1 mt-3">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
          </div>
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}
