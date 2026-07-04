import { ALL_POSTORS } from '../data/gameData'

export default function MatchHistory({ roundHistory, playerId }) {
  if (!roundHistory?.length) return null

  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Historial de matches</p>
      <div className="space-y-1.5">
        {roundHistory.map(({ round, results }) => {
          const r = results?.[playerId]
          if (!r) return null
          const postor = ALL_POSTORS[r.postorId]
          return (
            <div key={round} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-gray-400 w-12">Ronda {round}</span>
              <span className="text-xs text-gray-600 flex-1 truncate">{postor?.name ?? '?'}</span>
              <span className="text-rose-500 font-bold text-sm">{r.matches} ✨</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
