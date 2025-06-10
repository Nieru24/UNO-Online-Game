import React from "react";

interface LobbyProps {
  roomCode: string | null;
  players: { id: string; username: string }[];
  showStartButton: boolean;
  handleStartGame: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ roomCode, players, showStartButton, handleStartGame }) => (
  <div className="lobby flex flex-col justify-center items-center h-[500px] w-[800px] bg-[#DBD6D7] p-6 text-black rounded absolute">
    <div className="title text-3xl text-neutral-900 tracking-tighter text-center font-semibold w-[700px] border-b-2 border-solid border-[#928E8F] m-3 pb-1">
      Uno: Card Game
    </div>
    <div className="subtitle font-medium font-semibold text-lg text-neutral-900 text-center w-[500px] border-2 border-solid border-[#928E8F] rounded-xl mt-2 p-2">
      Room: {roomCode}
    </div>
    <div className="font-normal text-sm text-neutral-900 text-center w-[500px] mb-6">
      - Lets other join by sharing the room code -
    </div>
    <div className="w-[500px] h-[150px] max-h-[150px] border-2 border-solid border-[#928E8F] rounded-xl text-left text-neutral-900 w-[300px] mt-2 p-2">
      <h3 className="font-semibold mb-2">Players in Room:</h3>
      <ul className="flex flex-wrap gap-2 text-sm text-neutral-700">
        {players.map((p) => (
          <li
            className="border border-gray-300 rounded-md px-3 py-1 bg-white shadow-sm text-amber-500"
            key={p.id}
          >
            {p.username}
          </li>
        ))}
      </ul>
    </div>
    <div className={showStartButton ? "w-[500px]" : "invisible"}>
      <button
        onClick={handleStartGame}
        className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2 mt-2"
      >
        Start Game
      </button>
    </div>
  </div>
);

export default Lobby;