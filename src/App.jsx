import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import GameRoom from './screens/GameRoom'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fef9f4]">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/room/:roomCode" element={<GameRoom />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
