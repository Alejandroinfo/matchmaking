import { ATTRIBUTES } from '../data/gameData'

// Mini: compact grid card (2-4 per row)
// Full: detailed card (1 per row)
export default function PostorCard({ postor, selected, onClick, disabled, highlighted, badge, mini = false }) {
  if (mini) {
    return (
      <button
        onClick={onClick}
        disabled={disabled && !selected}
        className={`w-full text-left p-2 rounded-xl border transition-all ${
          selected
            ? 'border-rose-400 bg-rose-50 shadow-sm'
            : highlighted
            ? 'border-amber-300 bg-amber-50'
            : disabled
            ? 'border-gray-100 bg-gray-50 opacity-50'
            : 'border-rose-100 bg-white hover:border-rose-300'
        }`}
      >
        <div className="flex items-center gap-1 mb-1">
          {selected && <span className="text-rose-500 text-xs">💘</span>}
          {highlighted && !selected && <span className="text-amber-500 text-xs">💌</span>}
          <p className="font-semibold text-gray-800 text-xs truncate leading-tight">{postor.name}</p>
        </div>
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
          {ATTRIBUTES.map(attr => (
            <span key={attr.name} className="text-xs text-gray-500 leading-tight" title={`${attr.name}: ${postor[attr.name]}`}>
              {attr.emoji} <span className="text-gray-600">{postor[attr.name]}</span>
            </span>
          ))}
        </div>
      </button>
    )
  }

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
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500 flex-shrink-0">
          {postor.name.charAt(0)}
        </div>
        <p className="font-semibold text-gray-800 text-sm truncate">{postor.name}</p>
        {selected && <span className="text-rose-500 flex-shrink-0 ml-auto">💘</span>}
        {highlighted && !selected && <span className="text-amber-500 flex-shrink-0 ml-auto">💌</span>}
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
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">{badge}</div>
      )}
    </button>
  )
}
