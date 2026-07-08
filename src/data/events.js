// Selected events — each has an id, name, effect description, and type
// type: 'auto' = fully handled by code | 'social' = displayed as instruction only | 'partial' = mixed

export const EVENTS = [
  {
    id: 1, name: 'Pasatiempo doble', emoji: '🎨',
    effect: 'Los matches en Pasatiempo cuentan doble en el track de matchmaking esta ronda.',
    type: 'auto', attr: 'Pasatiempo', multiplier: 2,
  },
  {
    id: 2, name: 'Personalidad doble', emoji: '✨',
    effect: 'Los matches en Personalidad cuentan doble en el track de matchmaking esta ronda.',
    type: 'auto', attr: 'Personalidad', multiplier: 2,
  },
  {
    id: 3, name: 'Estilo de vida doble', emoji: '🌿',
    effect: 'Los matches en Estilo de vida cuentan doble en el track de matchmaking esta ronda.',
    type: 'auto', attr: 'Estilo de vida', multiplier: 2,
  },
  {
    id: 4, name: 'Valores doble', emoji: '💡',
    effect: 'Los matches en Valores cuentan doble en el track de matchmaking esta ronda.',
    type: 'auto', attr: 'Valores', multiplier: 2,
  },
  {
    id: 5, name: 'Intereses doble', emoji: '🎵',
    effect: 'Los matches en Intereses cuentan doble en el track de matchmaking esta ronda.',
    type: 'auto', attr: 'Intereses', multiplier: 2,
  },
  {
    id: 6, name: 'Ronda silenciosa', emoji: '🤫',
    effect: 'Sin pitch esta ronda. El swipe empieza inmediatamente.',
    type: 'auto', skipPitch: true,
  },
  {
    id: 8, name: 'Primera cita gratis', emoji: '🎁',
    effect: 'La primera cita que aceptes esta ronda no cuesta token.',
    type: 'auto', firstDateFree: true,
  },
  {
    id: 16, name: 'Tokens extra', emoji: '💰',
    effect: 'Esta ronda recibes +4 tokens en vez de +3.',
    type: 'auto', tokensThisRound: 4,
  },
  {
    id: 17, name: 'Escasez de tokens', emoji: '💸',
    effect: 'Esta ronda recibes solo +2 tokens en vez de +3.',
    type: 'auto', tokensThisRound: 2,
  },
  {
    id: 19, name: 'Cambio de mano', emoji: '🔄',
    effect: 'Antes de recomendar puedes descartar hasta 2 cartas de tu mano y robar nuevas del mazo.',
    type: 'social',
  },
  {
    id: 20, name: 'Recomendaciones anónimas', emoji: '🎭',
    effect: 'No sabes quién te recomendó qué esta ronda.',
    type: 'auto', anonymousRecs: true,
  },
  {
    id: 27, name: 'Solo 1 cita', emoji: '1️⃣',
    effect: 'Solo puedes aceptar 1 cita esta ronda.',
    type: 'auto', maxDates: 1,
  },
  {
    id: 28, name: 'Recuperación doble', emoji: '🎰',
    effect: 'Si aciertas la apuesta esta ronda recuperas 2 tokens en vez de 1.',
    type: 'auto', betReward: 2,
  },
  {
    id: 29, name: 'Mejor chemistry gana', emoji: '🏆',
    effect: 'El jugador con más matches totales esta ronda recibe +1 token extra.',
    type: 'auto', mostMatchesBonus: true,
  },
  {
    id: 32, name: 'Vecino elige tu cita propia', emoji: '👈',
    effect: 'El jugador a tu derecha elige qué postor te recomiendas a ti mismo si decides hacer una cita propia.',
    type: 'social',
  },
  {
    id: 33, name: 'Anuncia un atributo tuyo', emoji: '📢',
    effect: 'Antes del reveal cada jugador anuncia 1 atributo que cree tener. Si acierta gana 1 token.',
    type: 'social',
  },
  {
    id: 37, name: 'El más activo gana', emoji: '🌟',
    effect: 'El jugador que más citas acepte esta ronda gana 1 token extra.',
    type: 'auto', mostDatesBonus: true,
  },
  {
    id: 41, name: 'El perdedor elige', emoji: '🃏',
    effect: 'El jugador con menos tokens elige el evento de la próxima ronda entre 2 opciones.',
    type: 'social',
  },
  {
    id: 46, name: 'Apuesta vecino', emoji: '🤝',
    effect: 'El jugador a tu izquierda hace tu apuesta por ti. Si acierta os repartís el token recuperado.',
    type: 'social',
  },
  {
    id: 48, name: 'Compromiso de tokens', emoji: '🤜',
    effect: 'Antes de ver las recomendaciones, cada jugador anuncia en voz alta cuántos tokens va a gastar esta ronda.',
    type: 'social',
  },
  {
    id: 51, name: 'Reciclaje', emoji: '♻️',
    effect: 'Los postores del descarte pueden ser reclamados esta ronda como citas propias.',
    type: 'social',
  },
  {
    id: 52, name: 'Pide opinión', emoji: '💬',
    effect: 'Puedes pedir a cualquier jugador que te diga 1 atributo que cree que tienes.',
    type: 'social',
  },
  {
    id: 57, name: 'Segunda apuesta', emoji: '🎲',
    effect: 'Puedes hacer una segunda apuesta esta ronda. Si aciertas ambas recuperas 3 tokens.',
    type: 'social',
  },
  {
    id: 63, name: 'Mano ampliada', emoji: '✋',
    effect: 'Esta ronda recibes 3 cartas extra en tu mano.',
    type: 'auto', extraCards: 3,
  },
  {
    id: 67, name: 'Sin citas propias', emoji: '🚫',
    effect: 'Esta ronda no puedes usar cartas de tu propia mano para citas.',
    type: 'auto', noSelfDates: true,
  },
  {
    id: 77, name: 'Ronda de confianza', emoji: '🤞',
    effect: 'Si alguien dice "te lo juro" puedes aceptar hasta 1 cita adicional sin costo de token.',
    type: 'social',
  },
  {
    id: 80, name: 'Cita gratis', emoji: '🎀',
    effect: 'Todas las citas son gratis esta ronda (no cuestan token).',
    type: 'auto', allDatesFree: true,
  },
  {
    id: 84, name: 'Manos sobrantes', emoji: '🎴',
    effect: 'Las cartas que no uses esta ronda las conservas y se suman a tus 6 nuevas el próximo turno.',
    type: 'auto', carryUnused: true,
  },
  {
    id: 88, name: 'Doble o nada en apuesta', emoji: '⚡',
    effect: 'La apuesta requiere acierto exacto: si aciertas recuperas 2 tokens, si fallas no pasa nada.',
    type: 'auto', betDoubleOrNothing: true,
  },
  {
    id: 98, name: 'Punto de inflexión', emoji: '📈',
    effect: 'El jugador con menos tokens al inicio de esta ronda recibe 2 tokens extra.',
    type: 'auto', lowestTokenBonus: 2,
  },
]

export function drawEvent() {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)]
}

export function getEvent(id) {
  return EVENTS.find(e => e.id === id) ?? null
}
