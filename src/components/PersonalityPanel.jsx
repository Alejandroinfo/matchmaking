import { ATTRIBUTES, PRIORITY_POINTS } from '../data/gameData'

const WEIGHT_COLORS = [
  'bg-rose-500 text-white',
  'bg-rose-300 text-white',
  'bg-rose-300 text-white',
  'bg-rose-100 text-rose-400',
  'bg-rose-100 text-rose-400',
]

export default function PersonalityPanel({ personality = [], showValues = false, showPriority = false, compact = false }) {
  if (!personality.length) {
    return <p className="text-xs text-gray-400">Sin datos de personalidad</p>
  }

  return (
    <div className={`space-y-${compact ? '1' : '2'}`}>
      {personality.map((card, i) => {
        const attrDef = ATTRIBUTES.find(a => a.name === card.attribute)
        const pts = PRIORITY_POINTS[i]
        return (
          <div key={i} className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            {/* Weight badge */}
            <div className={`flex-shrink-0 flex items-center justify-center rounded-md font-bold tabular-nums ${
              compact ? 'w-6 h-5 text-xs' : 'w-7 h-6 text-xs'
            } ${WEIGHT_COLORS[i]}`}>
              {pts}p
            </div>
            <span className="flex-shrink-0">{attrDef?.emoji ?? '•'}</span>
            <span className="text-gray-500 flex-shrink-0">{card.attribute}</span>
            {showValues ? (
              <span className="font-semibold text-gray-800 flex-1">{card.value}</span>
            ) : (
              <span className="font-semibold text-rose-200 flex-1">????</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
