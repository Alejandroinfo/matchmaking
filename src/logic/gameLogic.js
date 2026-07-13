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
    // Fixed order: always Pasatiempo → Personalidad → Estilo → Valores → Intereses
    // Position 0 = 3pts, 1 = 2pts, 2 = 2pts, 3 = 1pt, 4 = 1pt
    const cards = attrs.map(attr => ({
      attribute: attr.name,
      value: pools[attr.name].pop(),
    }))
    personalities[playerId] = cards
  })
  return personalities
}

// Hand size always 6, plus extra from events
export function dealHands(playerIds, numOptions = 6, numAttributes = 4, extraCards = 0, carryOverHands = {}) {
  const handSize = 6 + extraCards
  const newCardCount = 6 + extraCards
  const pool = generatePostors(newCardCount * playerIds.length, numOptions, numAttributes)
  const hands = {}
  playerIds.forEach((pid, i) => {
    const newCards = pool.slice(i * newCardCount, (i + 1) * newCardCount)
    const carried = carryOverHands[pid] ?? []
    hands[pid] = [...carried, ...newCards]
  })
  return hands
}

// How many postors to recommend per player (2 for 3-player games, 1 otherwise)
export function recsPerPlayer(numPlayers) {
  return numPlayers <= 3 ? 2 : 1
}

export function computeCompatibility(personality, postor) {
  const priorityPoints = getPriorityPoints(personality.length)
  let ownPoints = 0
  let matches = 0
  const matchedAttrs = {}
  personality.forEach((card, i) => {
    const postorVal = postor[card.attribute]
    if (postorVal === card.value) {
      ownPoints += priorityPoints[i]
      matches++
      matchedAttrs[card.attribute] = true
    } else if (postorVal === ANTAGONISTS[card.value]) {
      ownPoints -= priorityPoints[i]
    }
  })
  return { ownPoints, matches, matchedAttrs }
}

// Personality is already in fixed attribute order.
// Just attach weight badges based on position.
export function sortedPersonalityDisplay(personality) {
  const priorityPoints = getPriorityPoints(personality.length)
  return personality.map((card, i) => ({ ...card, weight: priorityPoints[i] }))
}

// Compute match/opponent/neutral info for a postor vs a personality
export function getMatchInfo(personality, postor) {
  if (!personality?.length || !postor) return null
  const pts = getPriorityPoints(personality.length)
  const attrs = {}
  let score = 0
  personality.forEach((card, i) => {
    const postorVal = postor[card.attribute]
    if (!postorVal) return
    if (postorVal === card.value) {
      attrs[card.attribute] = { type: 'match', pts: pts[i] }
      score += pts[i]
    } else if (ANTAGONISTS[card.value] === postorVal) {
      attrs[card.attribute] = { type: 'opponent', pts: pts[i] }
      score -= pts[i]
    } else {
      attrs[card.attribute] = { type: 'neutral', pts: 0 }
    }
  })
  return { attrs, score }
}
