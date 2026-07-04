import { ATTRIBUTES } from '../data/gameData'

function AttrList({ postor }) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
      {ATTRIBUTES.map(attr => (
        <div key={attr.name} className="flex items-center gap-1 min-w-0">
          <span className="flex-shrink-0 text-sm">{attr.emoji}</span>
          <span className="text-xs text-gray-600 truncate">{postor[attr.name]}</span>
        </div>
      ))}
    </div>
  )
}

export default function PostorCard({ postor, selected, onClick, disabled, highlighted, badge }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled && !selected}
      className={`w-full text-left rounded-2xl border transition-all p-3 ${
        selected
          ? 'border-rose-400 bg-rose-50 shadow-sm'
          : highlighted
          ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
          : disabled
          ? 'border-gray-100 bg-gray-50 opacity-60'
          : 'border-rose-100 bg-white hover:border-rose-300 hover:shadow-sm'
      }`}
    >
      {/* Header: avatar + name + icon */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-500 flex-shrink-0">
          {postor.name.charAt(0)}
        </div>
        <p className="font-semibold text-gray-800 text-sm truncate flex-1 min-w-0">{postor.name}</p>
        {selected && <span className="flex-shrink-0 text-rose-500 text-sm">💘</span>}
        {highlighted && !selected && <span className="flex-shrink-0 text-amber-500 text-sm">💌</span>}
      </div>

      {/* Attributes in 2-col grid */}
      <AttrList postor={postor} />

      {/* Badge (recommender name) */}
      {badge && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-2 py-1 truncate">
          {badge}
        </div>
      )}
    </button>
  )
}
