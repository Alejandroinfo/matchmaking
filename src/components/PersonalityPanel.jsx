import { ATTRIBUTES } from '../data/gameData'
import { sortedPersonalityDisplay } from '../logic/gameLogic'

const WEIGHT_COLORS = [
  'bg-rose-500 text-white',
  'bg-rose-300 text-white',
  'bg-rose-200 text-rose-700',
  'bg-rose-100 text-rose-400',
]

export default function PersonalityPanel({ personality = [], showValues = false, compact = false }) {
  if (!personality.length) return <p className="text-xs text-gray-400">Sin datos</p>

  // Sort by fixed attribute order, preserving weights from shuffle
  const sorted = sortedPersonalityDisplay(personality)

  return (
    <div className={`space-y-${compact ? '1' : '2'}`}>
      {sorted.map((card, i) => {
        const attrDef = ATTRIBUTES.find(a => a.name === card.attribute)
        return (
          <div key={card.attribute} className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
            <div className={`flex-shrink-0 flex items-center justify-center rounded-md font-bold tabular-nums ${
              compact ? 'w-6 h-5 text-xs' : 'w-7 h-6 text-xs'
            } ${WEIGHT_COLORS[Math.min(i, WEIGHT_COLORS.length - 1)]} ${
              // Highlight the highest weight
              card.weight === 3 ? '!bg-rose-500 !text-white ring-2 ring-rose-300' :
              card.weight === 2 ? '!bg-rose-300 !text-white' :
              '!bg-rose-100 !text-rose-400'
            }`}>
              {card.weight}p
            </div>
            <span className="flex-shrink-0">{attrDef?.emoji ?? '•'}</span>
            <span className={`flex-shrink-0 text-gray-500 ${compact ? '' : 'min-w-[90px]'}`}>{card.attribute}</span>
            {showValues
              ? <span className="font-semibold text-gray-800 flex-1">{card.value}</span>
              : <span className="font-semibold text-rose-200 flex-1">????</span>
            }
          </div>
        )
      })}
    </div>
  )
}
