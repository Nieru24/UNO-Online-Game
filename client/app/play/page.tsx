"use client";
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../utils/userContext";
import { useSearchParams } from "next/navigation";

import shuffleArray from "../utils/shuffleArray";
import packOfCards from "../utils/packOfCards";
import CardAsset from "../utils/cardAsset";

export default function Game() {
  const socket = useRef<Socket | null>(null);

  const [players, setPlayers] = useState<{ id: string; username: string }[]>(
    []
  );
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [showStartButton, setShowStartButton] = useState(Boolean);

  const { username } = useUser();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");

  // For type of connection (Use ENV, later)
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

    // Test
    socket.current.on("joinedRoom", (data) => {
      console.log(data.message);
    });

    socket.current.on("playerListUpdate", (data) => {
      setPlayers(data.players);
      setOwnerId(data.ownerId);
      setShowStartButton(data.ownerId === data.realId);
      // console.log("Player list updated!!!")
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
  const [cardsPile, setCardsPile] = useState<{ id: string; code: string }[]>(
    []
  );

  // const [drawCardPile, setDrawCardPile] = useState([]);

  // useEffect(() => {
  //   const deck = packOfCards();
  //   const shuffled = shuffleArray(deck);
  //   setCardsPile(shuffled);
  // }, []);

  const [showLobby, setShowLobby] = useState(true);
  const handleStartGame = () => {
    const shuffledCards = shuffleArray(packOfCards());
    const cardsPile = [...shuffledCards];

    const deckWithIds = cardsPile.map((code, index) => ({
      id: `${code}-${index}`,
      code,
    }));
    setCardsPile(deckWithIds);
    const updatedPlayers = players.map((player) => ({
      ...player,
      deck: cardsPile.splice(0, 7),
    }));
    setShowLobby(false); //Remove comment after testing
    console.log(players);
    console.log(updatedPlayers);
    console.log(cardsPile);
  }; // Problem: no emmiting updatedPlayes and  cardsPile,

  return (
    <div className="text-white bg-black h-screen w-screen flex flex-col items-center justify-center relative">
      <div
        className={
          showLobby
            ? "lobby flex flex-col justify-center items-center h-[500px] w-[800px] bg-[#DBD6D7] p-6 text-black rounded absolute"
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
      <div className="game flex flex-col h-screen w-screen p-4 gap-2">
        <div className="topSectionBox flex flex-1 gap-2">
          <div className="leftEnemies flex flex-col justify-center items-center w-[15%] bg-red-600">
            Left Display
          </div>

          <div className="centerSectionBox flex flex-col flex-1 gap-2">
            <div className="topEnemies flex justify-center items-center h-[35%] bg-white">
              Top Display
            </div>

            <div className="centerDisplay flex-1 flex items-center justify-center bg-green-100 rounded">
              Center Display
            </div>
          </div>

          <div className="rightEnemies flex flex-col justify-center items-center w-[15%] bg-orange-600">
            Right Display
          </div>
        </div>

        <div className="youDisplay h-[35%] flex justify-center items-center bg-green-600">
          <div className="player-card">
            <div>Place Card</div>
            <div>
              In hand cards
              {cardsPile.map(({ id, code }) => (
                <div key={id} className="flex flex-col items-center">
                  <CardAsset code={code} size={60} />
                  <span className="text-white text-xs">{code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
