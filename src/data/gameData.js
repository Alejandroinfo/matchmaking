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
  {
    name: 'Intereses',
    emoji: '🎵',
    pairs: [['Arte', 'Ciencia'], ['Naturaleza', 'Ciudad'], ['Música', 'Silencio']],
  },
]

export const ATTR_OPTIONS = {}
export const ANTAGONISTS = {}

ATTRIBUTES.forEach(attr => {
  ATTR_OPTIONS[attr.name] = []
  attr.pairs.forEach(([a, b]) => {
    ATTR_OPTIONS[attr.name].push(a, b)
    ANTAGONISTS[a] = b
    ANTAGONISTS[b] = a
  })
})

export const PRIORITY_POINTS = [3, 2, 2, 1, 1]

// 150 postor names pool
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

// Seeded random for deterministic postor generation
function seededRand(seed) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function generatePostors() {
  const rand = seededRand(42)
  const attrKeys = ATTRIBUTES.map(a => a.name)
  const opts = attrKeys.map(k => ATTR_OPTIONS[k])

  // Near-orthogonal design: 144 base + 6 extras = 150
  const indices = []
  for (let a = 0; a < 6; a++) {
    for (let b = 0; b < 6; b++) {
      for (let k = 0; k < 4; k++) {
        indices.push([a, b, (a+b+k)%6, (a+2*b+k)%6, (2*a+b+k)%6])
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    indices.push([i, (i+3)%6, (i+1)%6, (i+4)%6, (i+2)%6])
  }

  // Shuffle order
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return indices.map((idxArr, i) => {
    const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
    const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
    const postor = { id: i, name: `${firstName} ${lastName}` }
    attrKeys.forEach((key, j) => { postor[key] = opts[j][idxArr[j]] })
    return postor
  })
}

export const ALL_POSTORS = generatePostors()
