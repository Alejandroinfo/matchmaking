import { ALL_ATTRIBUTES as ATTRIBUTES } from '../data/gameData'

export default function MatchHistory({ roundHistory, playerId, players }) {
  if (!roundHistory?.length) return null

  // Group by round
  const rounds = roundHistory
    .map(({ round, results, recommendations }) => {
      const dates = (results?.[playerId]?.acceptedDates ?? []).map(d => ({
        ...d,
        fromName: d.fromId && players ? players[d.fromId]?.name?.split(' ')[0] : null,
      }))
      const totalMatches = dates.reduce((s, d) => s + (d.matches ?? 0), 0)
      const totalPoints  = dates.reduce((s, d) => s + (d.ownPoints ?? 0), 0)
      return { round, dates, totalMatches, totalPoints }
    })
    .filter(r => r.dates.length > 0)

  if (!rounds.length) return null

  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Historial de citas</p>
      <div className="space-y-3">
        {rounds.map(({ round, dates, totalMatches, totalPoints }) => (
          <div key={round} className="border border-rose-100 rounded-2xl overflow-hidden">
            {/* Round header with totals */}
            <div className="flex items-center justify-between bg-rose-50 px-3 py-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">Ronda {round}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 font-medium">{totalMatches} ✨</span>
                <span className={`text-xs font-bold ${totalPoints >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  🔒 pts
                </span>
              </div>
            </div>

            {/* Dates in this round */}
            <div className="divide-y divide-rose-50">
              {dates.map((d, i) => (
                <div key={i} className="px-3 py-2 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{d.postor?.name}</span>
                    <span className="text-xs text-gray-500">{d.matches} ✨</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {ATTRIBUTES.filter(a => d.postor?.[a.name]).map(attr => (
                      <span key={attr.name} className="text-xs text-gray-400">
                        {attr.emoji} {d.postor[attr.name]}
                      </span>
                    ))}
                    {d.fromName && (
                      <span className="text-xs text-amber-600 ml-auto">💌 {d.fromName}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
