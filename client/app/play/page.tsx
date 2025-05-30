"use client";
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../utils/userContext";
import { useSearchParams } from "next/navigation";

import packOfCards from "../utils/packOfCards";
import shuffleArray from "../utils/shuffleArray";

export default function Game() {
  const socket = useRef<Socket | null>(null);

  const [players, setPlayers] = useState<{ id: string; username: string }[]>(
    []
  );
  const { username } = useUser();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");

  // For type of connection (Use ENV)
  const glitchAddress = "";
  const localAddress = "http://localhost:8080";

  useEffect(() => {
    if (!roomCode || !username) return;

    socket.current = io(localAddress, {
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("Connected");
      socket.current?.emit("joinRoom", { roomCode, username });
    });

    socket.current.on("joinedRoom", (data) => {
      console.log(data);
    });

    socket.current.on("playerListUpdate", (data) => {
      setPlayers(data.players);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [roomCode, username]);

  // Game start
  const [gameOver, setGameOver] = useState(true);
  const [winner, setWinner] = useState("");
  const [turn, setTurn] = useState("clockwise");
  const [currentColor, setCurrentColor] = useState("");
  const [currentNumber, setCurrentNumber] = useState("");
  const [cardsPile, setCardsPile] = useState([]);
  const [drawCardPile, setDrawCardPile] = useState([]);

  function generateDeck() {
    return ["red 1", "green 5", "wild", "yellow 3"]; // testing
  }

  const playersWithDecks = players.map((player) => ({
    ...player,
    deck: generateDeck(),
  }));

  const [showLobby, setShowLobby] = useState(true);
  const handleStartGame = () => {
    // setShowLobby(false); //Remove comment after testing
    console.log(playersWithDecks);
  };

  return (
    <div className="text-white bg-black h-screen w-screen flex flex-col items-center justify-center">
      <div
        className={
          showLobby
            ? "lobby flex flex-col justify-center items-center h-[500px] w-[800px] bg-[#DBD6D7] p-6 text-black rounded"
            : "hidden"
        }
      >
        <div className="title text-3xl text-neutral-900 tracking-tighter text-center font-semibold w-[700px] border-b-2 border-solid border-[#928E8F] m-3 pb-1">
          Uno: Card Game
        </div>
        <div className="subtitle font-medium font-semibold text-lg text-neutral-900 text-center w-[500px] border-2 border-solid border-[#928E8F] rounded-xl mt-2 p-2">
          Room: {roomCode}
        </div>
        <div className="font-normal text-sm text-neutral-900 text-center w-[500px] mb-6">
          - Lets other join by sharing this room code -
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
        <div className="startGame w-[500px]">
          <button
            onClick={handleStartGame}
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2 mt-2"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
