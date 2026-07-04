export const ATTRIBUTES = [
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
]

export const ANTAGONISTS = {}
ATTRIBUTES.forEach(attr => {
  attr.pairs.forEach(([a, b]) => {
    ANTAGONISTS[a] = b
    ANTAGONISTS[b] = a
  })
})

// Get options for an attribute based on numOptions setting (4 or 6)
export function getAttrOptions(attr, numOptions = 6) {
  const pairs = numOptions === 4 ? attr.pairs.slice(0, 2) : attr.pairs
  return pairs.flatMap(([a, b]) => [a, b])
}

export const PRIORITY_POINTS = [3, 2, 2, 1]

// Name pool for postors
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

let _nameCounter = 0
function nextName() {
  const i = _nameCounter++
  return `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]}`
}

// Generate a single postor with a unique uid
export function generatePostor(numOptions = 6) {
  const uid = Math.random().toString(36).substring(2, 9)
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const postor = { uid, name: `${firstName} ${lastName}` }
  ATTRIBUTES.forEach(attr => {
    const opts = getAttrOptions(attr, numOptions)
    postor[attr.name] = opts[Math.floor(Math.random() * opts.length)]
  })
  return postor
}

// Generate N unique postors
export function generatePostors(count, numOptions = 6) {
  _nameCounter = Math.floor(Math.random() * 50) // randomize name start
  return Array.from({ length: count }, () => generatePostor(numOptions))
}
