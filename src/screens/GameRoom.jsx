import { useParams } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import { JoinScreen } from './HomeScreen'
import LobbyScreen from './LobbyScreen'
import RecommendationScreen from './RecommendationScreen'
import PitchScreen from './PitchScreen'
import SwipeScreen from './SwipeScreen'
import RevealScreen from './RevealScreen'
import SoulmateScreen from './SoulmateScreen'
import EndScreen from './EndScreen'

export default function GameRoom() {
  const { roomCode } = useParams()
  const {
    game, loading, playerId, isHost, myPersonality,
    myHand, myRecommendations, mySwipes, myResult,
    myRemainingHand, roundHistory,
    sortedPlayers, otherPlayers,
  } = useGame(roomCode)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">💘</div>
          <p className="text-gray-400">Conectando...</p>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center card max-w-sm w-full py-8">
          <div className="text-4xl mb-3">😢</div>
          <p className="text-gray-600 font-semibold">Sala no encontrada</p>
          <a href="/" className="btn-primary inline-block mt-4">Volver al inicio</a>
        </div>
      </div>
    )
  }

  const playerInRoom = game.players?.[playerId]
  if (!playerInRoom) return <JoinScreen />

  const Nav = () => (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-rose-100 px-4 py-2 flex items-center justify-between max-w-5xl mx-auto">
      <span className="text-rose-500 font-bold text-sm">💘 Matchmaker</span>
      <div className="flex items-center gap-3">
        {game.status === 'playing' && (
          <span className="text-xs text-gray-400">Ronda {game.round}/{game.settings.totalRounds}</span>
        )}
        <span className="font-mono text-xs bg-rose-50 text-rose-500 px-2 py-1 rounded-lg">{roomCode}</span>
      </div>
    </div>
  )

  if (game.status === 'lobby') {
    return (
      <>
        <Nav />
        <LobbyScreen roomCode={roomCode} game={game} playerId={playerId} isHost={isHost} sortedPlayers={sortedPlayers} />
      </>
    )
  }

  if (game.status === 'finished' || game.phase === 'end') {
    return (
      <>
        <Nav />
        <EndScreen game={game} playerId={playerId} sortedPlayers={sortedPlayers} myPersonality={myPersonality} roomCode={roomCode} isHost={isHost} />
      </>
    )
  }

  return (
    <>
      <Nav />
      {game.phase === 'recommendation' && (
        <RecommendationScreen
          roomCode={roomCode} game={game} playerId={playerId}
          otherPlayers={otherPlayers} myHand={myHand}
          myRecommendations={myRecommendations} roundHistory={roundHistory}
        />
      )}
      {game.phase === 'pitch' && (
        <PitchScreen
          roomCode={roomCode} game={game} playerId={playerId}
          isHost={isHost} otherPlayers={otherPlayers} sortedPlayers={sortedPlayers}
        />
      )}
      {game.phase === 'swipe' && (
        <SwipeScreen
          roomCode={roomCode} game={game} playerId={playerId}
          otherPlayers={otherPlayers} mySwipes={mySwipes}
          myHand={myHand} sortedPlayers={sortedPlayers}
        />
      )}
      {game.phase === 'vote' && (
        <RevealScreen
          roomCode={roomCode} game={game} playerId={playerId}
          isHost={isHost} sortedPlayers={sortedPlayers}
        />
      )}
      {game.phase === 'reveal' && (
        <RevealScreen
          roomCode={roomCode} game={game} playerId={playerId}
          isHost={isHost} sortedPlayers={sortedPlayers}
        />
      )}
      {game.phase === 'soulmate' && (
        <SoulmateScreen
          roomCode={roomCode} game={game} playerId={playerId}
          sortedPlayers={sortedPlayers}
        />
      )}
    </>
  )
}
