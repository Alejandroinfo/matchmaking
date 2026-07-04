import { ATTRIBUTES } from '../data/gameData'

export default function PostorCard({ postor, selected, onClick, disabled, highlighted, badge }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled && !selected}
      className={`w-full text-left p-3 rounded-2xl border transition-all ${
        selected
          ? 'border-rose-400 bg-rose-50 shadow-sm'
          : highlighted
          ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
          : disabled
          ? 'border-gray-100 bg-gray-50 opacity-60'
          : 'border-rose-100 bg-white hover:border-rose-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500 flex-shrink-0">
              {postor.name.charAt(0)}
            </div>
            <p className="font-semibold text-gray-800 text-sm truncate">{postor.name}</p>
            {selected && <span className="text-rose-500 flex-shrink-0">💘</span>}
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
            {ATTRIBUTES.map(attr => (
              <div key={attr.name} className="flex items-center gap-1">
                <span className="text-xs">{attr.emoji}</span>
                <span className="text-xs text-gray-500 truncate">{postor[attr.name]}</span>
              </div>
            ))}
          </div>

          {badge && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
              {badge}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
