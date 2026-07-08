export const ALL_ATTRIBUTES = [
  {
    name: 'Pasatiempo',
    emoji: '🎨',
    pairs: [['Senderismo', 'Videojuegos'], ['Cocina', 'Comida a domicilio'], ['Lectura', 'Series']],
  },
  {
    name: 'Personalidad',
    emoji: '✨',
    pairs: [['Extrovertido', 'Introvertido'], ['Aventurero', 'Cauteloso'], ['Organizado', 'Espontáneo']],
  },
  {
    name: 'Estilo de vida',
    emoji: '🌿',
    pairs: [['Madrugador', 'Noctámbulo'], ['Deportista', 'Sedentario'], ['Viajero', 'Hogareño']],
  },
  {
    name: 'Valores',
    emoji: '💡',
    pairs: [['Ambicioso', 'Conformista'], ['Familiar', 'Independiente'], ['Generoso', 'Ahorrativo']],
  },
  {
    name: 'Intereses',
    emoji: '🎵',
    pairs: [['Arte', 'Ciencia'], ['Naturaleza', 'Ciudad'], ['Música', 'Silencio']],
  },
  {
    name: 'Humor',
    emoji: '😄',
    pairs: [['Sarcástico', 'Literal'], ['Oscuro', 'Ligero'], ['Improv', 'Guionizado']],
  },
]

export const ANTAGONISTS = {}
ALL_ATTRIBUTES.forEach(attr => {
  attr.pairs.forEach(([a, b]) => {
    ANTAGONISTS[a] = b
    ANTAGONISTS[b] = a
  })
})

// Active attributes based on setting
export function getAttributes(numAttributes = 4) {
  return ALL_ATTRIBUTES.slice(0, numAttributes)
}

// Priority points by position (4, 5, or 6 attributes)
export const PRIORITY_POINTS_4 = [3, 2, 2, 1]
export const PRIORITY_POINTS_5 = [3, 2, 2, 1, 1]
export const PRIORITY_POINTS_6 = [3, 3, 2, 2, 1, 1]

export function getPriorityPoints(numAttributes = 4) {
  if (numAttributes === 6) return PRIORITY_POINTS_6
  if (numAttributes === 5) return PRIORITY_POINTS_5
  return PRIORITY_POINTS_4
}

// Get options for an attribute based on numOptions (4 or 6)
export function getAttrOptions(attr, numOptions = 6) {
  const pairs = numOptions === 4 ? attr.pairs.slice(0, 2) : attr.pairs
  return pairs.flatMap(([a, b]) => [a, b])
}

// Attribute display order and emoji — used in PostorCard without needing numAttributes
export const ATTR_ORDER = ALL_ATTRIBUTES.map(a => a.name)
export const ATTR_EMOJI = Object.fromEntries(ALL_ATTRIBUTES.map(a => [a.name, a.emoji]))

// Name pools
const FIRST_NAMES = [
  'Alex','Sam','Jordan','Taylor','Morgan','Casey','Riley','Avery','Quinn','Skyler',
  'Drew','Blake','Reese','Sage','River','Phoenix','Dakota','Hayden','Jamie','Kendall',
  'Logan','Peyton','Rowan','Sydney','Tatum','Addison','Bailey','Cameron','Dylan','Emerson',
  'Finley','Gray','Harper','Jesse','Kai','Lane','Mason','Nova','Parker','Remy',
  'Sloane','Toby','Valor','Wren','Yael','Zion','Nico','Luna','Marco','Sofia',
  'Paola','Adrian','Paula','Bruno','Giancarlo','Alejandro','Yulia','Franklin',
]
const LAST_NAMES = [
  'García','Martínez','López','Sánchez','Rodríguez','González','Fernández','Torres',
  'Ramírez','Flores','Rivera','Morales','Cruz','Reyes','Ortiz','Herrera','Medina',
  'Vargas','Castro','Jiménez','Ruiz','Álvarez','Mendoza','Ramos','Vega',
  'Armas','Braithwaite','Valdivia','Bejarano',
]

// Track used names across a session to avoid repeats
const _usedNames = new Set()

function uniqueName() {
  // Try random combinations until we find an unused one
  const firstPool = [...FIRST_NAMES]
  const lastPool  = [...LAST_NAMES]
  // Shuffle both to try random order
  for (let i = firstPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [firstPool[i], firstPool[j]] = [firstPool[j], firstPool[i]]
  }
  for (let i = lastPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lastPool[i], lastPool[j]] = [lastPool[j], lastPool[i]]
  }
  for (const first of firstPool) {
    for (const last of lastPool) {
      const name = `${first} ${last}`
      if (!_usedNames.has(name)) {
        _usedNames.add(name)
        return name
      }
    }
  }
  // Pool exhausted — reset and start over
  _usedNames.clear()
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const last  = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const name  = `${first} ${last}`
  _usedNames.add(name)
  return name
}

export function resetUsedNames() { _usedNames.clear() }

export function generatePostor(numOptions = 6, numAttributes = 4) {
  const uid = Math.random().toString(36).substring(2, 9)
  const postor = { uid, name: uniqueName() }
  getAttributes(numAttributes).forEach(attr => {
    const opts = getAttrOptions(attr, numOptions)
    postor[attr.name] = opts[Math.floor(Math.random() * opts.length)]
  })
  return postor
}

export function generatePostors(count, numOptions = 6, numAttributes = 4) {
  return Array.from({ length: count }, () => generatePostor(numOptions, numAttributes))
}
