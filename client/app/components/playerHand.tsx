import React from "react";
import CardAsset from "../utils/cardAsset";

interface PlayerHandProps {
  thisPlayerDeck: { id: string; code: string }[];
  activeAction: "uno" | "color" | null;
  gameOnGoing: boolean;
  chooseColor: (color: string) => void;
  handleCardClick?: (code: string) => void;
  myPlayerId?: string;
  playerTurnIndex: number;
  shuffledPlayers: { id: string; username: string; deck?: any[] }[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({ gameOnGoing, thisPlayerDeck, activeAction, chooseColor, handleCardClick, myPlayerId, shuffledPlayers, playerTurnIndex }) => {

  const activePlayerId =
    Array.isArray(shuffledPlayers) &&
      typeof playerTurnIndex === "number" &&
      shuffledPlayers[playerTurnIndex]
      ? shuffledPlayers[playerTurnIndex].id
      : undefined;

  const isMyTurn = false;

  return (
    <div>
      {gameOnGoing === true && (
        <div className="playercard flex flex-row">
          {thisPlayerDeck.map(({ id, code }) => (
            <div
              key={id}
              onClick={isMyTurn ? () => handleCardClick && handleCardClick(code) : undefined}
              className={`flex flex-row items-center m-[2px] cursor-pointer ${!isMyTurn ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <CardAsset code={code} size={90} />
            </div>
          ))}
        </div>
      )}
      {activeAction === "uno" && (
        <div className="uno flex h-[35%] flex-row items-center justify-center">
          <button className="inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 m-1 font-medium text-white hover:bg-neutral-700 focus:ring-[#928E8F] focus:ring-offset-2">
            Uno!
          </button>
          <button className="inline-flex h-12 w-[500px] items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 m-1 font-medium text-white hover:bg-neutral-700 focus:ring-[#928E8F] focus:ring-offset-2">
            You didn't say Uno
          </button>
        </div>
      )}
      {activeAction === "color" && (
        <div className="pickColor flex h-[35%] flex-row items-center justify-center">
          <button onClick={() => chooseColor("R")} className="inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-l-xl border-neutral-900 bg-[#EA323C] px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2">
            Red
          </button>
          <button onClick={() => chooseColor("G")} className="inline-flex h-12 w-[120px] items-center justify-center gap-3 border-neutral-900 bg-[#33984B] px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2">
            Green
          </button>
          <button onClick={() => chooseColor("B")} className="inline-flex h-12 w-[120px] items-center justify-center gap-3 border-neutral-900 bg-[#0098DC] px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2">
            Blue
          </button>
          <button onClick={() => chooseColor("Y")} className="inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-r-xl border-neutral-900 bg-[#FFC825] px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2">
            Yellow
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerHand;