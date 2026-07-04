import { ATTRIBUTES } from '../data/gameData'

export default function MatchHistory({ roundHistory, playerId, players }) {
  if (!roundHistory?.length) return null

  const allDates = roundHistory.flatMap(({ round, results, recommendations }) => {
    const accepted = results?.[playerId]?.acceptedDates ?? []
    return accepted.map(d => {
      const fromName = d.fromId && players ? players[d.fromId]?.name?.split(' ')[0] : null
      return { round, ...d, fromName }
    })
  })

  if (!allDates.length) return null

  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Historial de citas</p>
      <div className="space-y-3">
        {allDates.map((d, i) => (
          <div key={i} className="bg-rose-50 rounded-xl p-2.5 border border-rose-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">R{d.round}</span>
                <span className="font-semibold text-gray-800 text-sm">{d.postor?.name}</span>
              </div>
              <span className="text-rose-500 font-bold text-sm">{d.matches} ✨</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
              {ATTRIBUTES.map(attr => (
                <div key={attr.name} className="flex items-center gap-1 text-xs">
                  <span>{attr.emoji}</span>
                  <span className="text-gray-500">{d.postor?.[attr.name]}</span>
                </div>
              ))}
            </div>
            {d.fromName && (
              <p className="mt-1.5 text-xs text-amber-600">💌 {d.fromName}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
