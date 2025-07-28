import React from "react";
import CardAsset from "../utils/cardAsset";

interface TopDisplayProps {
  gameOnGoing: boolean;
  currentCard: string;
  drawCard: () => void;
  leftEnemies: Enemy[];
  topEnemies: Enemy[];
  rightEnemies: Enemy[];
  devMode: boolean;
  myPlayerId?: string;
  playerTurnIndex: number;
  shuffledPlayers: { id: string; username: string; deck?: any[] }[];
  endTurn: () => void;
}

interface Enemy {
  id: string;
  username: string;
  deck: any[];
}



const TopDisplay: React.FC<TopDisplayProps> = ({
  leftEnemies,
  topEnemies,
  rightEnemies,
  devMode,
  gameOnGoing,
  currentCard,
  drawCard,
  myPlayerId,
  playerTurnIndex,
  shuffledPlayers,
  endTurn
}) => {

  const activePlayerId =
    Array.isArray(shuffledPlayers) &&
      typeof playerTurnIndex === "number" &&
      shuffledPlayers[playerTurnIndex]
      ? shuffledPlayers[playerTurnIndex].id
      : undefined;

  const isMyTurn = myPlayerId === activePlayerId;

  return (
    <div className="topSectionBox flex flex-1 gap-2">
      <div className="leftEnemies flex flex-col justify-center items-center w-[15%] bg-red-600">
        {leftEnemies.map((player) => (
          <div
            key={player.id}
            className={`mb-2 text-center ${player.id === activePlayerId ? "ring-4 ring-yellow-400 rounded-lg" : ""}`}
          >
            <div className="text-white">{player.username}</div>
            <div className="flex flex-wrap justify-center">
              {player.deck.map((card: any) => (
                <CardAsset key={card.id} code={devMode ? card.code : "Deck"} size={60} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="centerSectionBox flex flex-col flex-1 gap-2">
        <div className="topEnemies flex justify-center items-center h-[35%] bg-white">
          {topEnemies.map((player) => (
            <div
              key={player.id}
              className={`mx-2 text-center ${player.id === activePlayerId ? "ring-4 ring-yellow-400 rounded-lg" : ""}`}
            >
              <div className="text-black">{player.username}</div>
              <div className="flex flex-wrap justify-center">
                {player.deck.map((card: any) => (
                  <CardAsset key={card.id} code={devMode ? card.code : "Deck"} size={60} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="centerDisplay w-full h-full flex-1 flex flex-col items-center justify-center bg-green-100 rounded">
          <div className="w-full flex flex-col items-center justify-center">
            <div className="inline-flex h-12 w-[80%] items-center justify-center gap-3 rounded-sm bg-neutral-900 px-5 py-3 m-1  font-medium text-white">
              Players Turn
            </div>
          </div>
          <div className="flex-1 flex flex-row items-center justify-center h-full">
            <div className="flex flex-row items-center justify-center">
              <div className="m-2">
                <CardAsset code={gameOnGoing ? currentCard : "Deck"} size={150} />
              </div>
              <div className="m-2">
                <CardAsset code="Deck" size={150} />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <button
                disabled={!isMyTurn}
                onClick={isMyTurn ? endTurn : undefined}
                className={`inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-xl px-5 py-3 m-2 font-medium
    ${isMyTurn
                    ? "bg-neutral-900 text-white hover:bg-neutral-700 focus:ring-[#928E8F] focus:ring-offset-2"
                    : "bg-neutral-300 text-neutral-500 opacity-60 cursor-not-allowed"
                  }`}
              >
                End Turn
              </button>
              <button
                onClick={isMyTurn ? drawCard : undefined}
                disabled={!isMyTurn}
                className={`inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-xl px-5 py-3 m-2 font-medium
                  ${isMyTurn
                    ? "bg-neutral-900 text-white hover:bg-neutral-700 focus:ring-[#928E8F] focus:ring-offset-2"
                    : "bg-neutral-300 text-neutral-500 opacity-60 cursor-not-allowed"
                  }`}
              >
                Draw
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="rightEnemies flex flex-col justify-center items-center w-[15%] bg-orange-600">
        {rightEnemies.map((player) => (
          <div
            key={player.id}
            className={`mb-2 text-center ${player.id === activePlayerId ? "ring-4 ring-yellow-400 rounded-lg" : ""}`}
          >
            <div className="text-white">{player.username}</div>
            <div className="flex flex-wrap justify-center">
              {player.deck.map((card: any) => (
                <CardAsset key={card.id} code={devMode ? card.code : "Deck"} size={60} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
};

export default TopDisplay;