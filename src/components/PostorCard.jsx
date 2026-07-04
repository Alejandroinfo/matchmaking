import { ATTRIBUTES } from '../data/gameData'

function AttrList({ postor }) {
  return (
    <div className="mt-1.5 space-y-0.5">
      {ATTRIBUTES.map(attr => (
        <div key={attr.name} className="flex items-center gap-1 text-xs">
          <span className="flex-shrink-0 w-4 text-center">{attr.emoji}</span>
          <span className="text-gray-400 flex-shrink-0 w-[68px]">{attr.name}</span>
          <span className="font-medium text-gray-700 truncate">{postor[attr.name]}</span>
        </div>
      ))}
    </div>
  )
}

export default function PostorCard({ postor, selected, onClick, disabled, highlighted, badge, mini = false }) {
  const base = `w-full text-left rounded-2xl border transition-all ${
    selected
      ? 'border-rose-400 bg-rose-50 shadow-sm'
      : highlighted
      ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
      : disabled
      ? 'border-gray-100 bg-gray-50 opacity-60'
      : 'border-rose-100 bg-white hover:border-rose-300 hover:shadow-sm'
  }`

  return (
    <button onClick={onClick} disabled={disabled && !selected} className={`${base} p-2.5`}>
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-500 flex-shrink-0">
          {postor.name.charAt(0)}
        </div>
        <p className="font-semibold text-gray-800 text-sm truncate flex-1">{postor.name}</p>
        {selected && <span className="flex-shrink-0 text-rose-500">💘</span>}
        {highlighted && !selected && <span className="flex-shrink-0 text-amber-500">💌</span>}
      </div>
      <AttrList postor={postor} />
      {badge && (
        <div className="mt-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 truncate">
          {badge}
        </div>
      )}
    </button>
  )
}
