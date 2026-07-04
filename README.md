# Matchmaker 💘

Juego de deducción social multijugador en tiempo real. Descubre quién eres a través del amor — o al menos inténtalo mientras tus amigos te ayudan (o sabotean).

## Cómo se juega

### El concepto
Cada jugador tiene una personalidad oculta que define qué busca en una pareja. Puedes ver la personalidad de todos los demás, pero nunca la tuya propia. A lo largo de las rondas vas deduciendo quién eres según los resultados que obtienes con cada postor que eliges.

Pero no todos quieren que te vaya bien: algunos jugadores son tus **amigos** (ganan cuando tú ganas) y otros son tus **envidiosos** (pierden cuando tú ganas). Tú no sabes quién es quién.

---

### Estructura de una partida

#### Setup
- Cada jugador recibe 4 cartas de atributos ocultas que forman su personalidad
- El orden aleatorio de las cartas determina su **prioridad** (cuánto pesan en la compatibilidad)
- Los roles (amigo/envidioso/neutral) se asignan en secreto entre jugadores

#### Rondas regulares (configurables: 2–5)

**1. Recomendación**
Cada jugador recibe una mano privada de `N jugadores + 3` postores. Ve la personalidad de todos los demás (no la suya) y elige un postor de su mano para recomendarle a cada otro jugador.

**2. Selección**
Cada jugador ve las recomendaciones que recibió más sus cartas sobrantes de la mano. Elige libremente entre todas estas opciones — puede ignorar las recomendaciones si quiere.

**3. Revelación**
Se muestran los resultados: cuántos atributos matchearon con cada postor elegido (no los puntos exactos propios, sí los de los demás). Los amigos y envidiosos suman o restan según tus resultados.

#### Ronda final — Soulmate 💞
Sin recomendaciones de nadie. Cada jugador elige entre sus citas anteriores (postores de rondas pasadas) o su mano restante. Decisión personal pura basada en todo lo aprendido. Los puntos del soulmate son solo tuyos, sin modificadores de rol.

#### Pantalla final
Se revelan personalidades completas, roles, historial de citas ronda a ronda y desglose de puntos por amigos y envidiosos.

---

### Sistema de puntos

#### Compatibilidad por atributo
| Posición (prioridad) | Match | Antagónico | Otro |
|---|---|---|---|
| 1 (más importante) | +3 pts | −3 pts | 0 |
| 2 | +2 pts | −2 pts | 0 |
| 3 | +2 pts | −2 pts | 0 |
| 4 | +1 pt | −1 pt | 0 |

Máximo posible por ronda: **8 puntos**

#### Modificadores de rol (por ronda regular)
- **Amigo/a:** gana la mitad de tus puntos propios
- **Envidioso/a:** pierde la mitad de tus puntos propios
- **Neutral:** no se ve afectado

#### Ronda soulmate
Los puntos son directos, sin modificadores de rol.

---

### Atributos y antagónicos

| Atributo | Pares antagónicos |
|---|---|
| 🎨 Pasatiempo | Senderismo ↔ Videojuegos · Cocina ↔ Comida a domicilio · Lectura ↔ Series |
| ✨ Personalidad | Extrovertido ↔ Introvertido · Aventurero ↔ Cauteloso · Organizado ↔ Espontáneo |
| 🌿 Estilo de vida | Madrugador ↔ Noctámbulo · Deportista ↔ Sedentario · Viajero ↔ Hogareño |
| 💡 Valores | Ambicioso ↔ Conformista · Familiar ↔ Independiente · Generoso ↔ Ahorrativo |

---

### Distribución de roles por número de jugadores

| Jugadores | Amigos | Envidiosos | Neutrales |
|---|---|---|---|
| 2 | 1 | 0 | 0 |
| 3 | 1 | 1 | 0 |
| 4 | 1 | 1 | 1 |
| 5 | 2 | 2 | 0 |
| 6 | 2 | 2 | 1 |

Los roles son **direccionales**: que A sea amigo de B no significa que B sea amigo de A.

---

### Pool de personalidades

El pool de cartas de personalidad escala con el número de jugadores:
- **3–4 jugadores:** 2 copias de cada opción por atributo
- **5–6 jugadores:** 3 copias de cada opción por atributo

Esto garantiza que la certeza absoluta sobre un atributo propio sea posible pero infrecuente.

---

### Postores

150 postores pregenerados con distribución casi perfecta entre atributos (sin correlación entre ellos). Cada partida usa un subconjunto aleatorio sin reemplazo.

---

## Setup técnico

### 1. Crear proyecto en Firebase
1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Agrega una app web y copia las credenciales
4. En **Firestore Database** → Crear base de datos → Modo de producción
5. En **Reglas**, pega el contenido de `firestore.rules`

### 2. Variables de entorno
```bash
cp .env.example .env.local
```
Llena `.env.local` con tus credenciales de Firebase.

### 3. Correr localmente
```bash
npm install
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173)

### 4. Deploy en Vercel
1. Sube el proyecto a GitHub (sin `node_modules`, sin `.env.local`)
2. En [vercel.com](https://vercel.com) → Import → selecciona el repo
3. Agrega las 6 variables de entorno de `.env.local` en Vercel
4. Deploy

---

## Stack técnico
- **Frontend:** React 18 + Vite
- **Base de datos:** Firebase Firestore (tiempo real)
- **Estilos:** Tailwind CSS
- **Routing:** React Router v6
- **Hosting:** Vercel (frontend) + Firebase (database)

## Estructura del proyecto
```
src/
├── data/
│   └── gameData.js         # Atributos, antagónicos, generador de 150 postores
├── logic/
│   └── gameLogic.js        # Personalidades, roles, manos, compatibilidad
├── services/
│   └── gameService.js      # Operaciones Firebase
├── hooks/
│   └── useGame.js          # Hook de estado en tiempo real
├── components/
│   ├── PersonalityPanel.jsx
│   ├── PostorCard.jsx
│   ├── AntagonistTable.jsx
│   └── MatchHistory.jsx
└── screens/
    ├── HomeScreen.jsx
    ├── LobbyScreen.jsx
    ├── GameRoom.jsx         # Contenedor principal
    ├── RecommendationScreen.jsx
    ├── SelectionScreen.jsx
    ├── RevealScreen.jsx
    ├── SoulmateScreen.jsx
    └── EndScreen.jsx
```
