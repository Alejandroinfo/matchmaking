import { ATTRIBUTES, PRIORITY_POINTS } from '../data/gameData'

const PRIORITY_LABELS = ['⭐⭐⭐', '⭐⭐', '⭐⭐', '⭐', '⭐']

export default function PersonalityPanel({ personality = [], showValues = false, showPriority = false, compact = false }) {
  if (!personality.length) {
    return <p className="text-xs text-gray-400">Sin datos de personalidad</p>
  }

  return (
    <div className={`space-y-${compact ? '1' : '2'}`}>
      {personality.map((card, i) => {
        const attrDef = ATTRIBUTES.find(a => a.name === card.attribute)
        return (
          <div key={i} className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <span className="flex-shrink-0">{attrDef?.emoji ?? '•'}</span>
            <span className="text-gray-500 flex-shrink-0 min-w-[80px]">{card.attribute}</span>
            {showValues ? (
              <span className="font-semibold text-gray-800 flex-1">{card.value}</span>
            ) : (
              <span className="font-semibold text-rose-300 flex-1">????</span>
            )}
            {showPriority && (
              <span className="text-xs text-amber-500 flex-shrink-0">{PRIORITY_LABELS[i]} ({PRIORITY_POINTS[i]}p)</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
