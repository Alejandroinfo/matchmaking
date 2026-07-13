import { ATTR_ORDER, ATTR_EMOJI } from '../data/gameData'

function avatarUrl(uid) {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${uid}&backgroundColor=ffd5dc,ffdfbf,d1d5e8,d4f7d4&radius=0`
}

export default function PostorCard({ postor, selected, onClick, disabled, badge, matchInfo, className = '' }) {
  const activeAttrs = ATTR_ORDER.filter(name => postor[name] != null)

  return (
    <button
      onClick={onClick}
      disabled={disabled && !selected}
      className={`w-full text-left rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${
        selected ? 'border-rose-400 shadow-rose-200 shadow-md'
        : disabled ? 'border-gray-100 opacity-60'
        : 'border-transparent hover:border-rose-200 hover:shadow-md'
      } ${className}`}
    >
      {/* Avatar */}
      <div className="relative bg-rose-50" style={{ paddingBottom: '65%' }}>
        <img src={avatarUrl(postor.uid)} alt={postor.name}
          className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
          <p className="text-white font-bold text-sm drop-shadow leading-tight">{postor.name}</p>
          {selected && <span className="text-rose-300 text-xs">💘 Seleccionado</span>}
        </div>
        {/* Compatibility score badge */}
        {matchInfo && (
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${
            matchInfo.score > 0 ? 'bg-emerald-500 text-white'
            : matchInfo.score < 0 ? 'bg-rose-600 text-white'
            : 'bg-gray-600 text-white'
          }`}>
            {matchInfo.score > 0 ? '+' : ''}{matchInfo.score} pts
          </div>
        )}
      </div>

      {/* Attributes */}
      <div className="bg-white px-3 py-2.5 space-y-1">
        {activeAttrs.map(name => {
          const info = matchInfo?.attrs?.[name]
          const isMatch = info?.type === 'match'
          const isOpp   = info?.type === 'opponent'
          return (
            <div key={name} className={`flex items-center gap-1.5 rounded-lg px-1 py-0.5 -mx-1 ${
              isMatch ? 'bg-emerald-50' : isOpp ? 'bg-rose-50' : ''
            }`}>
              <span className="text-sm flex-shrink-0">{ATTR_EMOJI[name]}</span>
              <span className={`text-xs leading-snug flex-1 ${
                isMatch ? 'text-emerald-700 font-semibold'
                : isOpp ? 'text-rose-600 font-semibold'
                : 'text-gray-600'
              }`}>{postor[name]}</span>
              {isMatch && <span className="text-xs font-bold text-emerald-600">+{info.pts}</span>}
              {isOpp   && <span className="text-xs font-bold text-rose-500">−{info.pts}</span>}
            </div>
          )
        })}
        {badge && (
          <div className="mt-1 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">{badge}</div>
        )}
      </div>
    </button>
  )
}
