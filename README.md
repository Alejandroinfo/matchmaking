# Blindspot 💘

Juego de deducción social de 3 a 6 jugadores. Descubre tus propias preferencias románticas a través de las citas que aceptas, lo que ves en los demás, y tu instinto acumulado. Al final, describe a tu pareja ideal y demuestra cuánto te conoces.

---

## Concepto

Cada jugador tiene una **personalidad oculta** — una carta de postor que define qué busca en pareja. Puedes ver la personalidad de todos los demás, pero nunca la tuya propia. A lo largo de las rondas recibes recomendaciones, aceptas o rechazas citas, y acumulas pistas sobre ti mismo. El juego termina con una prueba final de autoconocimiento: el soulmate.

---

## Flujo de una partida

### Setup
- Cada jugador recibe 1 carta de postor como su **personalidad oculta** (no la ve, los demás sí)
- La prioridad es siempre fija: **Pasatiempo 3pts → Personalidad 2pts → Estilo de vida 2pts → Valores 1pt → Intereses 1pt**
- Cada jugador recibe una mano de **6 cartas** de postores
- Cada jugador empieza con **0 tokens** (recibe 3 al inicio de cada ronda)

---

### Cada ronda

**0. Evento** *(opcional, si está activado)*
Se revela un evento aleatorio que modifica las reglas de esa ronda.

**1. Recomendación**
Ves la personalidad de todos los demás (no la tuya). Asignas postors de tu mano a cada otro jugador como recomendación.
- Con **6 mano**, das 1 a cada jugador y guardas el resto
- **Regla especial 3 jugadores:** das 2 postors a cada otro jugador

**2. Pitch** *(configurable 60/90/120s)*
Tiempo libre para convencer a los demás de aceptar tus recomendaciones.

**3. Swipe**
Ves las recomendaciones recibidas y tus cartas sobrantes. Por cada recomendación decides:
- **💚 Aceptar** → gastas 1 token, el recomendador gana 1 token de los tuyos
- **❌ Rechazar** → sin coste

Con tus cartas sobrantes puedes hacer una **cita propia** (🎲):
- Gastas 1 token → va a la caja (nadie lo gana)
- Útil si no confías en las recomendaciones o prefieres no dar tokens a nadie

**4. Apuesta** *(opcional, si está activada)*
Antes del reveal, declaras cuántos matches crees que tuviste en total. Si aciertas: recuperas 1 token propio.

**5. Reveal**
Se muestran resultados: citas aceptadas, tokens, track de matchmaking.

---

### Ronda final — Soulmate 💞
Sin recomendaciones. Describes tu pareja ideal eligiendo un valor por atributo. Es tu mejor hipótesis sobre tu personalidad. Los puntos valen **el doble (×2)**.

| Posición | Match | Antagónico |
|---|---|---|
| 1 — Pasatiempo | +6 pts | −6 pts |
| 2 — Personalidad | +4 pts | −4 pts |
| 3 — Estilo de vida | +4 pts | −4 pts |
| 4 — Valores | +2 pts | −2 pts |
| 5 — Intereses | +2 pts | −2 pts |

---

## Sistema de puntos

### Tokens 🪙
| Acción | Efecto |
|---|---|
| Inicio de cada ronda | +3 tokens |
| Aceptar recomendación | −1 token tuyo → +1 al recomendador |
| Cita propia | −1 token → va a la caja |
| Apuesta correcta | +1 token recuperado |

Tokens restantes al final = **1 punto cada uno**.

### Track de matchmaking 🏹
Por cada cita aceptada de tu recomendación, sus matches se suman a tu track. Al final, el líder del track gana **+3 puntos bonus**.

### Puntuación final
```
Score = tokens restantes + soulmate ×2 + bonus track (+3 si líder)
```

---

## Atributos y antagónicos

| Posición | Atributo | Pares antagónicos |
|---|---|---|
| 1 · 3pts | 🎨 Pasatiempo | Senderismo ↔ Videojuegos · Cocina ↔ Comida a domicilio · Lectura ↔ Series |
| 2 · 2pts | ✨ Personalidad | Extrovertido ↔ Introvertido · Aventurero ↔ Cauteloso · Organizado ↔ Espontáneo |
| 3 · 2pts | 🌿 Estilo de vida | Madrugador ↔ Noctámbulo · Deportista ↔ Sedentario · Viajero ↔ Hogareño |
| 4 · 1pt | 💡 Valores | Ambicioso ↔ Conformista · Familiar ↔ Independiente · Generoso ↔ Ahorrativo |
| 5 · 1pt | 🎵 Intereses | Arte ↔ Ciencia · Naturaleza ↔ Ciudad · Música ↔ Silencio *(con 5 atributos)* |

Con **4 opciones** se usan solo los primeros 2 pares de cada atributo.

---

## Probabilidad de matches

Con 5 atributos y 4 opciones (versión física):

| Matches | Probabilidad |
|---|---|
| 0 | 23.7% |
| 1 | 39.6% |
| 2 | 26.4% |
| 3 | 8.8% |
| 4 | 1.5% |
| 5 | 0.1% |

---

## Componentes (versión física)

| Componente | Cantidad | Especificación |
|---|---|---|
| Cartas de postor | 250 | 63×88mm. Nombre + 5 atributos (4 opciones c/u) + avatar |
| Parantes de jugador | 6 | Cartulina A5 doblada. Oculta la personalidad al propio jugador |
| Hojas de referencia | 6 | Cuarto de hoja. Fases + tabla de ayuda |
| Tokens | 54 | Disco por color (6 colores × 9) |
| Cubos de matchmaking | 6 | Cubo del color del jugador, se mueven en el tablero |
| Tablero central | 1 | A4/A3. Track 1-25 + marcador de ronda + marcador de fase + mazo + descarte |
| Cartas de evento | 30 | Tamaño mini. Evento + efecto |
| Manual de reglas | 1 | A5, con ejemplos |
| Caja | 1 | Con separadores |

---

## Configuración (setup digital)

| Parámetro | Opciones | Default |
|---|---|---|
| Rondas | 2 / 3 / 4 / 5 | 3 |
| Atributos | 4 / 5 | 4 |
| Opciones por atributo | 4 / 6 | 6 |
| Tiempo de pitch | 60s / 90s / 120s | 60s |
| Eventos | Activados / Desactivados | Desactivados |
| Apuesta | Activada / Desactivada | Activada |

---

## Regla especial — 3 jugadores
Cada jugador recomienda **2 postors** a cada otro jugador (en vez de 1). Recibes 4 recomendaciones en el swipe. La mano de 6 cartas se mantiene.

---

## Eventos (módulo opcional)

30 eventos disponibles que se sortean al inicio de cada ronda si el módulo está activado. Ejemplos:

- 🎨 **Pasatiempo doble** — matches en Pasatiempo valen el doble
- 🤫 **Ronda silenciosa** — sin pitch, swipe inmediato
- 🎭 **Recomendaciones anónimas** — no sabes quién te recomendó qué
- 🎀 **Cita gratis** — todas las citas son gratuitas
- 🎴 **Manos sobrantes** — cartas no usadas pasan a la siguiente ronda

---

## Setup técnico

### Firebase
1. [console.firebase.google.com](https://console.firebase.google.com) → nuevo proyecto
2. App web → copiar credenciales
3. Firestore → crear → pegar `firestore.rules`

### Local
```bash
cp .env.example .env.local   # añadir credenciales Firebase
npm install
npm run dev                   # → localhost:5173
```

### Vercel
1. Subir a GitHub (sin `node_modules`, sin `.env.local`)
2. [vercel.com](https://vercel.com) → Import → añadir variables de entorno
3. Deploy

---

## Stack
React 18 · Vite · Firebase Firestore · Tailwind CSS · React Router v6 · DiceBear avatars · Vercel
