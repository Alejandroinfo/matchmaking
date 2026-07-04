import { ATTRIBUTES, ATTR_OPTIONS, ANTAGONISTS, PRIORITY_POINTS, ALL_POSTORS } from '../data/gameData'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function dealPersonalities(playerIds) {
  const n = playerIds.length
  const copiesPerOption = n <= 4 ? 2 : 3

  const pools = {}
  ATTRIBUTES.forEach(attr => {
    pools[attr.name] = shuffle(ATTR_OPTIONS[attr.name].flatMap(opt =>
      Array(copiesPerOption).fill(opt)
    ))
  })

  const personalities = {}
  playerIds.forEach(playerId => {
    // Shuffle to randomize priority order
    const cards = shuffle(ATTRIBUTES.map(attr => ({
      attribute: attr.name,
      value: pools[attr.name].pop(),
    })))
    personalities[playerId] = cards
  })
  return personalities
}

// Deal private hands: numPlayers + 3 postors per player, no overlap
export function dealHands(playerIds) {
  const handSize = playerIds.length + 3
  const shuffled = shuffle([...ALL_POSTORS])
  const hands = {}
  playerIds.forEach((pid, i) => {
    hands[pid] = shuffled.slice(i * handSize, (i + 1) * handSize).map(p => p.id)
  })
  return hands
}

export function assignRoles(playerIds) {
  const n = playerIds.length
  const roles = {}

  const distributions = {
    2: ['friend'],
    3: ['friend', 'enemy'],
    4: ['friend', 'enemy', 'neutral'],
    5: ['friend', 'friend', 'enemy', 'enemy'],
    6: ['friend', 'friend', 'enemy', 'enemy', 'neutral'],
  }

  playerIds.forEach(playerId => {
    const others = playerIds.filter(id => id !== playerId)
    const dist = shuffle([...(distributions[n] ?? distributions[3])])
    roles[playerId] = {}
    others.forEach((otherId, i) => {
      roles[playerId][otherId] = dist[i]
    })
  })
  return roles
}

export function computeCompatibility(personality, postorId) {
  const postor = ALL_POSTORS[postorId]
  let ownPoints = 0
  let matches = 0

  personality.forEach((card, i) => {
    const postorVal = postor[card.attribute]
    if (postorVal === card.value) {
      ownPoints += PRIORITY_POINTS[i]
      matches++
    } else if (postorVal === ANTAGONISTS[card.value]) {
      ownPoints -= PRIORITY_POINTS[i]
    }
  })

  return { ownPoints, matches }
}

export function computeRolePoints(playerId, allResults, roles) {
  const myRoles = roles[playerId] || {}
  let rolePoints = 0
  Object.entries(myRoles).forEach(([targetId, role]) => {
    const targetOwnPoints = allResults[targetId]?.ownPoints ?? 0
    if (role === 'friend') rolePoints += targetOwnPoints / 2
    if (role === 'enemy') rolePoints -= targetOwnPoints / 2
  })
  return Math.round(rolePoints * 10) / 10
}

// Sort personality display to match fixed attribute order (for easy postor comparison)
// but preserve original priority weights from shuffled positions
export function sortedPersonalityDisplay(personality) {
  const attrOrder = ATTRIBUTES.map(a => a.name)
  // Build weight map from original shuffled positions
  const weightMap = {}
  personality.forEach((card, i) => {
    weightMap[card.attribute] = PRIORITY_POINTS[i]
  })
  // Sort by fixed attribute order
  return [...personality]
    .sort((a, b) => attrOrder.indexOf(a.attribute) - attrOrder.indexOf(b.attribute))
    .map(card => ({ ...card, weight: weightMap[card.attribute] }))
}

export function getRoleLabel(role) {
  return { friend: 'Amigo/a', enemy: 'Envidioso/a', neutral: 'Neutral' }[role] || '?'
}

export function getRoleColor(role) {
  return {
    friend: 'text-emerald-600 bg-emerald-50',
    enemy: 'text-rose-600 bg-rose-50',
    neutral: 'text-gray-500 bg-gray-50',
  }[role] || ''
}
