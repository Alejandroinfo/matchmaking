import { getAttributes, getAttrOptions, ANTAGONISTS, getPriorityPoints, generatePostors } from '../data/gameData'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function dealPersonalities(playerIds, numOptions = 6, numAttributes = 4) {
  const attrs = getAttributes(numAttributes)
  const n = playerIds.length
  const copiesPerOption = n <= 4 ? 2 : 3

  const pools = {}
  attrs.forEach(attr => {
    const opts = getAttrOptions(attr, numOptions)
    pools[attr.name] = shuffle(opts.flatMap(opt => Array(copiesPerOption).fill(opt)))
  })

  const personalities = {}
  playerIds.forEach(playerId => {
    const cards = shuffle(attrs.map(attr => ({
      attribute: attr.name,
      value: pools[attr.name].pop(),
    })))
    personalities[playerId] = cards
  })
  return personalities
}

// Hand size always 6
export function dealHands(playerIds, numOptions = 6, numAttributes = 4) {
  const handSize = 6
  const total = handSize * playerIds.length
  const pool = generatePostors(total, numOptions, numAttributes)
  const hands = {}
  playerIds.forEach((pid, i) => {
    hands[pid] = pool.slice(i * handSize, (i + 1) * handSize)
  })
  return hands
}

export function computeCompatibility(personality, postor) {
  const priorityPoints = getPriorityPoints(personality.length)
  let ownPoints = 0
  let matches = 0
  personality.forEach((card, i) => {
    const postorVal = postor[card.attribute]
    if (postorVal === card.value) {
      ownPoints += priorityPoints[i]
      matches++
    } else if (postorVal === ANTAGONISTS[card.value]) {
      ownPoints -= priorityPoints[i]
    }
  })
  return { ownPoints, matches }
}

export function sortedPersonalityDisplay(personality) {
  const attrOrder = getAttributes(personality.length).map(a => a.name)
  const priorityPoints = getPriorityPoints(personality.length)
  const weightMap = {}
  personality.forEach((card, i) => { weightMap[card.attribute] = priorityPoints[i] })
  return [...personality]
    .sort((a, b) => attrOrder.indexOf(a.attribute) - attrOrder.indexOf(b.attribute))
    .map(card => ({ ...card, weight: weightMap[card.attribute] }))
}
