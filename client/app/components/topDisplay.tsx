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
}) => (
  <div className="topSectionBox flex flex-1 gap-2">
    <div className="leftEnemies flex flex-col justify-center items-center w-[15%] bg-red-600">
      {leftEnemies.map((player) => (
        <div key={player.id} className="mb-2 text-center">
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
          <div key={player.id} className="mx-2 text-center">
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
              onClick={() => console.log("End Turn clicked")}
              className="inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 m-2 font-medium text-white hover:bg-neutral-700 focus:ring-[#928E8F] focus:ring-offset-2"
            >
              End Turn
            </button>
            <button
              onClick={drawCard}
              className="inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 m-2 font-medium text-white hover:bg-neutral-700 focus:ring-[#928E8F] focus:ring-offset-2"
            >
              Draw
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="rightEnemies flex flex-col justify-center items-center w-[15%] bg-orange-600">
      {rightEnemies.map((player) => (
        <div key={player.id} className="mb-2 text-center">
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
);

export default TopDisplay;