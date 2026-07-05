# Matchmaker 💘

Juego de deducción social multijugador en tiempo real. Descubre quién eres a través del amor — o al menos inténtalo mientras tus amigos te ayudan (o sabotean).

---

## Concepto

Cada jugador tiene una **personalidad oculta** que define qué busca en una pareja. Puedes ver la personalidad de todos los demás, pero nunca la tuya propia. A lo largo de las rondas vas deduciendo quién eres según las citas que aceptas y los resultados que obtienes. Al final, describes a tu pareja ideal para demostrar cuánto te conoces.

---

## Flujo de una partida

### Setup
- Cada jugador recibe N cartas de atributos ocultas que forman su personalidad
- El orden aleatorio determina la **prioridad** de cada atributo (cuánto pesa en el soulmate)
- Cada jugador recibe una mano de **6 cartas** de postores
- Cada jugador comienza con **0 tokens** (gana 3 al inicio de cada ronda)

---

### Cada ronda

#### 1. Recomendación
Ves la personalidad de todos los demás (no la tuya). Asignas una carta de tu mano a cada otro jugador como recomendación. Te quedan entre 1 y 4 cartas según el número de jugadores.

#### 2. Pitch 🗣️
Timer configurable (60/90/120s) donde todos hablan libremente. Defiende tus recomendaciones, convence a los demás de aceptarlas. El host puede saltar el timer.

#### 3. Swipe
Ves las recomendaciones que recibiste y tus cartas sobrantes. Para cada recomendación decides:
- **💚 Aceptar** → gastas 1 token, el recomendador gana 1 token
- **❌ Rechazar** → sin coste

Con tus cartas sobrantes puedes hacer una **cita propia** (🎲):
- Gastas 1 token → va a la caja (nadie lo gana)
- Útil si no confías en las recomendaciones o prefieres no dar puntos a nadie

#### 4. Reveal
Se muestran los resultados: citas aceptadas, tokens ganados/perdidos, y el estado del **track de matchmaking**.

---

### Ronda final — Soulmate 💞

Sin recomendaciones. Describes tu pareja ideal eligiendo un valor por atributo. Es tu mejor hipótesis sobre tu propia personalidad.

Los puntos valen **el doble** (×2) comparado con una cita normal. Quien acierte más atributos gana más; quien ponga el antagónico de su valor real pierde puntos.

---

## Sistema de puntos

### Tokens 🪙
| Acción | Efecto |
|---|---|
| Inicio de cada ronda | +3 tokens |
| Aceptar recomendación de otro | −1 token (va al recomendador) |
| Cita propia (sobrante de mano) | −1 token (va a la caja) |
| Alguien acepta tu recomendación | +1 token |

Tokens no gastados al final = **1 punto cada uno**.

### Compatibilidad en el soulmate (×2)
| Posición (prioridad) | Match | Antagónico |
|---|---|---|
| 1 (más importante) | +6 pts | −6 pts |
| 2 | +4 pts | −4 pts |
| 3 | +4 pts | −4 pts |
| 4 | +2 pts | −2 pts |
| 5 (solo con 5 atributos) | +2 pts | −2 pts |

### Track de matchmaking 🏹
Por cada cita aceptada de tu recomendación, el número de matches de esa cita se suma a tu track acumulado. Al final del juego, el jugador con más puntos en el track gana **+3 puntos bonus**. En caso de empate, todos los empatados reciben el bonus.

### Puntuación final
```
Score = tokens restantes + soulmate (×2) + bonus matchmaking (+3 si líder del track)
```

---

## Atributos y antagónicos

| Atributo | Pares antagónicos (6 opciones) |
|---|---|
| 🎨 Pasatiempo | Senderismo ↔ Videojuegos · Cocina ↔ Comida a domicilio · Lectura ↔ Series |
| ✨ Personalidad | Extrovertido ↔ Introvertido · Aventurero ↔ Cauteloso · Organizado ↔ Espontáneo |
| 🌿 Estilo de vida | Madrugador ↔ Noctámbulo · Deportista ↔ Sedentario · Viajero ↔ Hogareño |
| 💡 Valores | Ambicioso ↔ Conformista · Familiar ↔ Independiente · Generoso ↔ Ahorrativo |
| 🎵 Intereses | Arte ↔ Ciencia · Naturaleza ↔ Ciudad · Música ↔ Silencio *(solo con 5 atributos)* |

Con **4 opciones** se usan solo los primeros 2 pares de cada atributo.

---

## Distribución de roles por número de jugadores

No hay roles de amigo/envidioso. La economía de tokens crea la tensión natural: todos quieren que sus recomendaciones sean aceptadas (ganan tokens), y todos tienen que decidir cuánto gastar en citas (pierden tokens).

---

## Configuración (setup)

| Parámetro | Opciones | Default |
|---|---|---|
| Rondas | 2 / 3 / 4 / 5 | 3 |
| Atributos | 4 / 5 | 4 |
| Opciones por atributo | 4 / 6 | 6 |
| Tiempo de pitch | 60s / 90s / 120s | 60s |

---

## Setup técnico

### 1. Firebase
1. [console.firebase.google.com](https://console.firebase.google.com) → nuevo proyecto
2. Agrega una app web → copia credenciales
3. Firestore Database → crear → pega `firestore.rules`

### 2. Variables de entorno
```bash
cp .env.example .env.local
# Llena con tus credenciales de Firebase
```

### 3. Local
```bash
npm install
npm run dev   # → localhost:5173
```

### 4. Deploy en Vercel
1. Sube a GitHub (sin `node_modules`, sin `.env.local`)
2. [vercel.com](https://vercel.com) → Import → selecciona repo
3. Agrega las 6 variables de `.env.local` en Environment Variables
4. Deploy → URL lista para compartir

---

## Estructura del proyecto

```
src/
├── data/
│   └── gameData.js              # Atributos, antagónicos, generador de postores
├── logic/
│   └── gameLogic.js             # Personalidades, manos, compatibilidad
├── services/
│   └── gameService.js           # Operaciones Firebase
├── hooks/
│   └── useGame.js               # Estado en tiempo real
├── components/
│   ├── PersonalityPanel.jsx     # Muestra atributos con pesos
│   ├── PostorCard.jsx           # Carta estilo Tinder con avatar DiceBear
│   ├── AntagonistTable.jsx      # Tabla de opuestos
│   ├── MatchHistory.jsx         # Historial de citas aceptadas
│   └── PersonalNotes.jsx        # Notas privadas persistentes
└── screens/
    ├── HomeScreen.jsx            # Crear sala
    ├── JoinScreen.jsx            # Unirse via link
    ├── LobbyScreen.jsx           # Sala de espera + config
    ├── GameRoom.jsx              # Contenedor principal de fases
    ├── RecommendationScreen.jsx  # Asignar cartas a otros
    ├── PitchScreen.jsx           # Timer de convencimiento
    ├── SwipeScreen.jsx           # Aceptar/rechazar citas
    ├── RevealScreen.jsx          # Resultados + track matchmaking
    ├── SoulmateScreen.jsx        # Describir tu pareja ideal
    └── EndScreen.jsx             # Puntuación final + breakdown
```

---

## Stack técnico
- **Frontend:** React 18 + Vite
- **Base de datos:** Firebase Firestore (tiempo real)
- **Estilos:** Tailwind CSS
- **Avatares:** DiceBear (SVG, sin librería adicional)
- **Routing:** React Router v6
- **Deploy:** Vercel + Firebase
