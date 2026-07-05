import { ATTR_ORDER, ATTR_EMOJI } from '../data/gameData'

function avatarUrl(uid) {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${uid}&backgroundColor=ffd5dc,ffdfbf,d1d5e8,d4f7d4&radius=0`
}

export default function PostorCard({ postor, selected, onClick, disabled, badge, className = '' }) {
  // Auto-detect which attributes this postor has, in fixed order
  const activeAttrs = ATTR_ORDER.filter(name => postor[name] != null)
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
      {/* Avatar */}
      <div className="relative bg-rose-50" style={{ paddingBottom: '65%' }}>
        <img
          src={avatarUrl(postor.uid)}
          alt={postor.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
          <p className="text-white font-bold text-sm drop-shadow leading-tight">{postor.name}</p>
          {selected && <span className="text-rose-300 text-xs">💘 Seleccionado</span>}
        </div>
      </div>

      {/* Attributes — no truncation, text wraps */}
      <div className="bg-white px-3 py-2.5 space-y-1">
        {activeAttrs.map(name => (
          <div key={name} className="flex items-start gap-1.5 min-w-0">
            <span className="text-sm flex-shrink-0 mt-0.5">{ATTR_EMOJI[name]}</span>
            <span className="text-xs text-gray-600 leading-snug">{postor[name]}</span>
          </div>
        ))}
        {badge && (
          <div className="mt-1 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
            {badge}
          </div>
        )}
      </div>
    </button>
  )
}
