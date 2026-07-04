import { ATTRIBUTES } from '../data/gameData'

// DiceBear avatar URL — lightweight SVG, no library needed
function avatarUrl(uid) {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${uid}&backgroundColor=ffd5dc,ffdfbf,d1d5e8,d4f7d4&radius=0`
}

export default function PostorCard({ postor, selected, onClick, disabled, badge, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled && !selected}
      className={`w-full text-left rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${
        selected
          ? 'border-rose-400 shadow-rose-200 shadow-md'
          : disabled
          ? 'border-gray-100 opacity-60'
          : 'border-transparent hover:border-rose-200 hover:shadow-md'
      } ${className}`}
    >
      {/* Avatar image section */}
      <div className="relative bg-rose-50" style={{ paddingBottom: '70%' }}>
        <img
          src={avatarUrl(postor.uid)}
          alt={postor.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {/* Gradient overlay with name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
          <p className="text-white font-bold text-sm drop-shadow leading-tight">{postor.name}</p>
          {selected && <span className="text-rose-300 text-xs">💘 Seleccionado</span>}
        </div>
      </div>

      {/* Attributes section */}
      <div className="bg-white px-3 py-2.5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {ATTRIBUTES.map(attr => (
            <div key={attr.name} className="flex items-center gap-1 min-w-0">
              <span className="text-sm flex-shrink-0">{attr.emoji}</span>
              <span className="text-xs text-gray-600 truncate">{postor[attr.name]}</span>
            </div>
          ))}
        </div>
        {badge && (
          <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 truncate">
            {badge}
          </div>
        )}
      </div>
    </button>
  )
}
