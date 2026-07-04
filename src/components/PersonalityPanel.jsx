import { ATTRIBUTES, ANTAGONISTS } from '../data/gameData'
import { sortedPersonalityDisplay } from '../logic/gameLogic'

export default function PersonalityPanel({ personality = [], showValues = false, compact = false }) {
  if (!personality.length) return <p className="text-xs text-gray-400">Sin datos</p>

  const sorted = sortedPersonalityDisplay(personality)
  const size = compact ? 'text-xs' : 'text-sm'

  return (
    <div className="space-y-1">
      {sorted.map((card) => {
        const attrDef = ATTRIBUTES.find(a => a.name === card.attribute)
        const antagonist = ANTAGONISTS[card.value]
        return (
          <div key={card.attribute} className={`flex items-center gap-1.5 ${size}`}>
            {/* Weight badge — fixed width */}
            <span className={`flex-shrink-0 inline-flex items-center justify-center rounded font-bold tabular-nums
              ${compact ? 'w-6 h-4 text-[10px]' : 'w-7 h-5 text-xs'}
              ${card.weight === 3 ? 'bg-rose-500 text-white ring-1 ring-rose-300' :
                card.weight === 2 ? 'bg-rose-300 text-white' :
                'bg-rose-100 text-rose-400'}`}>
              {card.weight}p
            </span>
            {/* Emoji — fixed width */}
            <span className="flex-shrink-0 w-4 text-center">{attrDef?.emoji ?? '•'}</span>
            {/* Attribute name — fixed width so values always align */}
            <span className={`flex-shrink-0 text-gray-400 ${compact ? 'w-[72px]' : 'w-[96px]'}`}>
              {card.attribute}
            </span>
            {/* Value + antagonist */}
            {showValues ? (
              <span className="flex items-center gap-1 min-w-0">
                <span className="font-semibold text-gray-800 truncate">{card.value}</span>
                {antagonist && (
                  <span className="text-red-500 font-medium flex-shrink-0">({antagonist})</span>
                )}
              </span>
            ) : (
              <span className="font-semibold text-rose-200">????</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
