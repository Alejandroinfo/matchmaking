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

// Priority points by position (supports 4 or 5 attributes)
export const PRIORITY_POINTS_4 = [3, 2, 2, 1]
export const PRIORITY_POINTS_5 = [3, 2, 2, 1, 1]

export function getPriorityPoints(numAttributes = 4) {
  return numAttributes === 5 ? PRIORITY_POINTS_5 : PRIORITY_POINTS_4
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
]
const LAST_NAMES = [
  'García','Martínez','López','Sánchez','Rodríguez','González','Fernández','Torres',
  'Ramírez','Flores','Rivera','Morales','Cruz','Reyes','Ortiz','Herrera','Medina',
  'Vargas','Castro','Jiménez','Ruiz','Álvarez','Mendoza','Ramos','Vega',
]

export function generatePostor(numOptions = 6, numAttributes = 4) {
  const uid = Math.random().toString(36).substring(2, 9)
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const postor = { uid, name: `${firstName} ${lastName}` }
  getAttributes(numAttributes).forEach(attr => {
    const opts = getAttrOptions(attr, numOptions)
    postor[attr.name] = opts[Math.floor(Math.random() * opts.length)]
  })
  return postor
}

export function generatePostors(count, numOptions = 6, numAttributes = 4) {
  return Array.from({ length: count }, () => generatePostor(numOptions, numAttributes))
}
