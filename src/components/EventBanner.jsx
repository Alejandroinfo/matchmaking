export default function EventBanner({ event }) {
  if (!event) return null
  return (
    <div className="card border-amber-300 bg-amber-50">
      <div className="flex items-center gap-3">
        <span className="text-2xl flex-shrink-0">{event.emoji}</span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">Evento de ronda</p>
          <p className="font-bold text-gray-800">{event.name}</p>
          <p className="text-sm text-gray-600 mt-0.5">{event.effect}</p>
          {event.type === 'social' && (
            <p className="text-xs text-amber-600 mt-1 italic">Los jugadores gestionan este evento entre ellos</p>
          )}
        </div>
      </div>
    </div>
  )
}
