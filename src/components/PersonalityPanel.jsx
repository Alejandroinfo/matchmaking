import { ALL_ATTRIBUTES, ANTAGONISTS } from '../data/gameData'
import { sortedPersonalityDisplay } from '../logic/gameLogic'

export default function PersonalityPanel({ personality = [], showValues = false }) {
  if (!personality.length) return <p className="text-xs text-gray-400">Sin datos</p>

  const sorted = sortedPersonalityDisplay(personality)

  return (
    <div className="space-y-2">
      {sorted.map((card) => {
        const attrDef = ALL_ATTRIBUTES.find(a => a.name === card.attribute)
        const antagonist = ANTAGONISTS[card.value]
        return (
          <div key={card.attribute} className="flex gap-2">
            {/* Weight badge — aligns with first line */}
            <span className={`flex-shrink-0 mt-0.5 inline-flex items-center justify-center rounded font-bold text-[10px] w-6 h-4
              ${card.weight === 3 ? 'bg-rose-500 text-white ring-1 ring-rose-300' :
                card.weight === 2 ? 'bg-rose-300 text-white' :
                'bg-rose-100 text-rose-400'}`}>
              {card.weight}p
            </span>
            <div className="min-w-0">
              {/* Line 1: emoji + attribute name */}
              <p className="text-xs text-gray-400 leading-tight">
                {attrDef?.emoji} {card.attribute}
              </p>
              {/* Line 2: value + antagonist */}
              {showValues ? (
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {card.value}
                  {antagonist && (
                    <span className="text-red-500 font-medium ml-1.5 text-xs">({antagonist})</span>
                  )}
                </p>
              ) : (
                <p className="text-sm font-semibold text-rose-200 leading-tight">????</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
