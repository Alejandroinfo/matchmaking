import { getAttributes } from '../data/gameData'

function binomialProb(n, k, p) {
  // C(n,k) * p^k * (1-p)^(n-k)
  let coef = 1
  for (let i = 0; i < k; i++) coef = coef * (n - i) / (i + 1)
  return coef * Math.pow(p, k) * Math.pow(1 - p, n - k)
}

export default function AntagonistTable({ numOptions = 6, numAttributes = 4 }) {
  const numPairs = numOptions / 2
  const attributes = getAttributes(numAttributes)
  const p = 1 / numOptions

  // Match probabilities
  const matchProbs = Array.from({ length: numAttributes + 1 }, (_, k) => ({
    k,
    prob: binomialProb(numAttributes, k, p),
  }))

  return (
    <div className="card space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tabla de ayuda</p>

      {/* Probability of matches */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">
          Probabilidad de matches ({numAttributes} atributos, {numOptions} opciones)
        </p>
        <div className="space-y-1.5">
          {matchProbs.map(({ k, prob }) => {
            const pct = prob * 100
            return (
              <div key={k} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">{k} match{k !== 1 ? 'es' : ''}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-rose-300 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-mono text-gray-600 w-10 text-right flex-shrink-0">
                  {pct.toFixed(pct < 1 ? 1 : 0)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Antagonist pairs */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Opuestos por atributo</p>
        <div className="space-y-3">
          {attributes.map(attr => (
            <div key={attr.name}>
              <p className="text-xs text-gray-500 mb-1">{attr.emoji} {attr.name}</p>
              <div className="space-y-1">
                {attr.pairs.slice(0, numPairs).map(([a, b]) => (
                  <div key={a} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-gray-800 flex-1">{a}</span>
                    <span className="text-gray-300 font-bold">↔</span>
                    <span className="text-sm text-gray-800 flex-1 text-right">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
