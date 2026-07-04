# Matchmaker 💘

Juego de deducción social multijugador en tiempo real.

## Setup en 5 pasos

### 1. Crear proyecto en Firebase
1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un nuevo proyecto (ej: `matchmaker-game`)
3. Agrega una app web y copia las credenciales
4. En **Firestore Database** → Crear base de datos → Modo de producción
5. En **Reglas de Firestore**, pega el contenido de `firestore.rules`

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```
Llena `.env.local` con las credenciales de Firebase.

### 3. Instalar y correr localmente
```bash
npm install
npm run dev
```

### 4. Deploy en Vercel
1. Sube el proyecto a GitHub
2. En [vercel.com](https://vercel.com) → Import Project → selecciona tu repo
3. En **Environment Variables**, agrega todas las variables de `.env.local`
4. Deploy ✓

### 5. Compartir con amigos
Comparte la URL de Vercel. El host crea la sala, los demás se unen con el código de 5 letras.

---

## Cómo se juega

1. **Lobby**: El host configura rondas (2-5) y número de postores (10-20)
2. **Recomendación**: Cada jugador ve la personalidad de los demás (no la suya) y recomienda un postor para cada uno
3. **Selección**: Cada jugador ve las recomendaciones que recibió y elige un postor
4. **Revelación**: Se muestran los resultados — cuántos atributos matchearon (no cuáles)
5. Se repite por N rondas, acumulando puntos
6. Al final se revelan personalidades completas, roles y ganador

## Sistema de puntos
- Match en posición 1 → 3 puntos
- Match en posiciones 2-3 → 2 puntos cada uno
- Match en posiciones 4-5 → 1 punto cada uno
- Antagónico → resta los mismos puntos
- Amigo/a: gana la mitad de tus puntos
- Envidioso/a: pierde la mitad de tus puntos

## Stack técnico
- React + Vite
- Firebase Firestore (tiempo real)
- Tailwind CSS
- React Router v6
- Deploy: Vercel (frontend) + Firebase (database)
