import { ATTRIBUTES } from '../data/gameData'

export default function AntagonistTable() {
  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Opuestos por atributo</p>
      <div className="space-y-1.5">
        {ATTRIBUTES.map(attr => (
          <div key={attr.name}>
            <p className="text-xs font-medium text-gray-400 mb-1">{attr.emoji} {attr.name}</p>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {attr.pairs.map(([a, b]) => (
                <div key={a} className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                  <span className="text-gray-700 truncate">{a}</span>
                  <span className="text-gray-400 flex-shrink-0">↔</span>
                  <span className="text-gray-700 truncate">{b}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
