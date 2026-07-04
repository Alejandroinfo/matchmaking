import { ALL_POSTORS, ATTRIBUTES } from '../data/gameData'

function MiniAttrList({ postor }) {
  if (!postor) return null
  return (
    <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
      {ATTRIBUTES.map(attr => (
        <div key={attr.name} className="flex items-center gap-1 min-w-0">
          <span className="text-xs flex-shrink-0">{attr.emoji}</span>
          <span className="text-xs text-gray-500 truncate">{postor[attr.name]}</span>
        </div>
      ))}
    </div>
  )
}

export default function MatchHistory({ roundHistory, playerId, players }) {
  if (!roundHistory?.length) return null

  return (
    <div className="card">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Historial de citas</p>
      <div className="space-y-4">
        {roundHistory.map(({ round, results, recommendations, availableOptions }) => {
          const r = results?.[playerId]
          if (!r) return null
          const chosen = ALL_POSTORS[r.postorId]

          // Who recommended the chosen postor to me
          const recommenderEntry = Object.entries(recommendations ?? {}).find(
            ([fromId, recs]) => fromId !== playerId && recs[playerId] === r.postorId
          )
          const recommenderName = recommenderEntry
            ? players?.[recommenderEntry[0]]?.name?.split(' ')[0]
            : null

          // Unchosen options
          const notChosen = (availableOptions?.[playerId] ?? [])
            .map(opt => ({
              postor: ALL_POSTORS[opt.postorId],
              fromName: opt.fromPlayerId ? players?.[opt.fromPlayerId]?.name?.split(' ')[0] : null,
            }))
            .filter(opt => opt.postor)

          return (
            <div key={round} className="border-b border-rose-50 last:border-0 pb-4 last:pb-0">
              <p className="text-xs font-bold text-gray-400 mb-2">Ronda {round}</p>

              {/* Chosen postor */}
              <div className="bg-rose-50 rounded-xl p-2.5 border border-rose-200">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-500 text-xs font-bold">✓ Elegiste</span>
                    <span className="font-semibold text-gray-800 text-sm">{chosen?.name}</span>
                  </div>
                  <span className="text-rose-500 font-bold text-sm">{r.matches} ✨</span>
                </div>
                <MiniAttrList postor={chosen} />
                {recommenderName && (
                  <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
                    💌 Recomendado por {recommenderName}
                  </p>
                )}
              </div>

              {/* Unchosen options */}
              {notChosen.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs text-gray-400">También disponibles:</p>
                  {notChosen.map((opt, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {opt.postor.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-600 truncate">{opt.postor.name}</span>
                      </div>
                      <MiniAttrList postor={opt.postor} />
                      {opt.fromName && (
                        <p className="mt-1 text-xs text-gray-400">💌 {opt.fromName}</p>
                      )}
                      {!opt.fromName && (
                        <p className="mt-1 text-xs text-gray-400">🃏 Tu mano</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
