import { getAttributes } from '../data/gameData'

export default function AntagonistTable({ numOptions = 6, numAttributes = 4 }) {
  const numPairs = numOptions / 2
  const attributes = getAttributes(numAttributes)

  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tabla de opuestos</p>
      <div className="space-y-3">
        {attributes.map(attr => (
          <div key={attr.name}>
            <p className="text-sm font-semibold text-gray-600 mb-1.5">{attr.emoji} {attr.name}</p>
            <div className="space-y-1">
              {attr.pairs.slice(0, numPairs).map(([a, b]) => (
                <div key={a} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-800 flex-1">{a}</span>
                  <span className="text-gray-400 font-bold">↔</span>
                  <span className="text-sm text-gray-800 flex-1 text-right">{b}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
