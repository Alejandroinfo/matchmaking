import { ATTR_ORDER } from '../data/gameData'

function avatarUrl(uid) {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${uid}&backgroundColor=ffd5dc,ffdfbf,d1d5e8,d4f7d4&radius=0`
}

// Signature color per attribute — 6 clearly distinct hues
const ATTR_COLOR = {
  'Pasatiempo':    '#e74c3c',  // vivid red
  'Personalidad':  '#2980b9',  // bright blue
  'Estilo de vida':'#27ae60',  // vivid green
  'Valores':       '#8e44ad',  // vivid purple
  'Intereses':     '#e67e22',  // vivid orange
  'Humor':         '#e91e8c',  // vivid magenta
}

// Priority badge colors
const PRI_COLOR = {
  '3p': '#d62828',  // crimson
  '2p': '#1d7dbd',  // blue
  '1p': '#5a6e5a',  // forest green
}

// Emoji per value
const VALUE_EMOJI = {
  'Senderismo':        '🥾',
  'Videojuegos':       '🎮',
  'Cocina':            '🍳',
  'Comida a domicilio':'🛵',
  'Extrovertido':      '🎉',
  'Introvertido':      '📚',
  'Aventurero':        '🧭',
  'Cauteloso':         '🛡️',
  'Madrugador':        '🌅',
  'Noctámbulo':        '🌙',
  'Deportista':        '⚽',
  'Sedentario':        '🛋️',
  'Ambicioso':         '🚀',
  'Conformista':       '☕',
  'Familiar':          '🏠',
  'Independiente':     '🦅',
  'Arte':              '🎨',
  'Ciencia':           '🔬',
  'Naturaleza':        '🌿',
  'Ciudad':            '🏙️',
  'Sarcástico':        '😏',
  'Literal':           '📐',
  'Oscuro':            '🖤',
  'Ligero':            '☀️',
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
      <div className="relative bg-slate-100" style={{ paddingBottom: '62%' }}>
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
      <div className="bg-white px-0 py-1 space-y-0">
        {activeAttrs.map(name => {
          const value = postor[name]
          const info = matchInfo?.attrs?.[name]
          const isMatch = info?.type === 'match'
          const isOpp   = info?.type === 'opponent'

          // Get priority from personality if available (else show neutral)
          const attrColor = ATTR_COLOR[name] ?? '#888'
          const emoji = VALUE_EMOJI[value] ?? '•'

          return (
            <div key={name} className={`flex items-center gap-1.5 px-2 py-1 ${
              isMatch ? 'bg-emerald-50' : isOpp ? 'bg-rose-50' : ''
            }`}>
              {/* Attribute color band */}
              <div className="w-1 self-stretch rounded-full flex-shrink-0"
                   style={{ backgroundColor: attrColor, minHeight: '28px' }} />

              {/* Emoji */}
              <span className="text-base flex-shrink-0 leading-none">{emoji}</span>

              {/* Label + Value stacked */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 font-medium leading-none mb-0.5"
                   style={{ fontSize: '9px', letterSpacing: '0.04em' }}>
                  {name.toUpperCase()}
                </p>
                <p className={`font-bold leading-tight truncate ${
                  isMatch ? 'text-emerald-700' : isOpp ? 'text-rose-600' : 'text-gray-800'
                }`} style={{ fontSize: '13px' }}>
                  {value}
                </p>
              </div>

              {/* Match pts indicator */}
              {isMatch && (
                <span className="text-xs font-bold text-emerald-600 flex-shrink-0">+{info.pts}</span>
              )}
              {isOpp && (
                <span className="text-xs font-bold text-rose-500 flex-shrink-0">−{info.pts}</span>
              )}
            </div>
          )
        })}
        {badge && (
          <div className="mx-2 mb-1 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
            {badge}
          </div>
        )}
      </div>
    </button>
  )
}
