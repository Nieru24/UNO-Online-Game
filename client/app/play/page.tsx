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

  const { username } = useUser();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get("roomCode");

  // For type of connection (Use ENV, later)
  const glitchAddress = "";
  const serverAddress = process.env.NEXT_PUBLIC_SERVER_ADDRESS;


  // For Game
  type ActionType = "uno" | "color" | null;
  const devMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  const [players, setPlayers] = useState<{ id: string; username: string }[]>(
    []
  );
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [showStartButton, setShowStartButton] = useState(Boolean);
  const [cardsPile, setCardsPile] = useState<{ id: string; code: string }[]>(
    []
  );
  const [playedCardsPile, setPlayedCardsPile] = useState<{ id: string; code: string }[]>(
    []
  );
  const [thisPlayerDeck, setThisPlayerDeck] = useState<any[]>([]);
  const [theEnemiesDeck, setTheEnemiesDeck] = useState<any[]>([]);

  const [showLobby, setShowLobby] = useState(true);
  const [activeAction, setActiveAction] = useState<ActionType>(null); // Set(color) if wild card is played, get back after color is picked
  const [topEnemies, setTopEnemies] = useState<any[]>([]);
  const [leftEnemies, setLeftEnemies] = useState<any[]>([]);
  const [rightEnemies, setRightEnemies] = useState<any[]>([]);
  const [gameOver, setGameOver] = useState(true);
  const [winner, setWinner] = useState("");
  const [turn, setTurn] = useState("clockwise"); // Turn will be based on shuffledPlayers state using index
  const [currentColor, setCurrentColor] = useState("");
  const [currentNumber, setCurrentNumber] = useState("");


  // For socket connection
  useEffect(() => {
    if (!roomCode || !username) return;

    socket.current = io(serverAddress, {
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("Connected");
      socket.current?.emit("joinRoom", { roomCode, username });
    });

    // Test
    // socket.current.on("joinedRoom", (data) => {
    //   console.log(data.message);
    // });

    return () => {
      socket.current?.disconnect();
    };
  }, [roomCode, username]);


  // For lobby
  useEffect(() => {
    if (!socket.current) return;

    const handlePlayerListUpdate = (data: any) => {
      setPlayers(data.players);
      setOwnerId(data.ownerId);
      setShowStartButton(data.ownerId === data.realId);
    };

    // Update for every player that joined in lobby(socket room)
    socket.current.on("playerListUpdate", handlePlayerListUpdate);

    return () => {
      socket.current?.off("playerListUpdate", handlePlayerListUpdate);
    };
  }, []);


  // For handleGameStart
  useEffect(() => {
    if (!socket.current) return;

    const handleGameStarted = ({ updatedPlayers, shuffledPlayers, cardsPile }: any) => {
      const thisPlayerID = socket.current?.id;
      const thisPlayer = updatedPlayers.find((p: any) => p.id === thisPlayerID);

      const testEnemiesDeck = shuffledPlayers.filter((p: any) => p.id !== thisPlayerID);
      const leftEnemies = testEnemiesDeck.filter((_: any, index: number) => index % 3 === 1);
      const topEnemies = testEnemiesDeck.filter((_: any, index: number) => index % 3 === 0);
      const rightEnemies = testEnemiesDeck.filter((_: any, index: number) => index % 3 === 2);

      setLeftEnemies(leftEnemies);
      setTopEnemies(topEnemies);
      setRightEnemies(rightEnemies);

      const testDeck = [{ id: 'D4W-0', code: 'D4W' }, { id: 'D4W-1', code: 'D4W' }, { id: 'D4W-2', code: 'D4W' }, { id: 'D4W-3', code: 'D4W' }, { id: 'D4W-4', code: 'D4W' }, { id: 'D4W-5', code: 'D4W' }, { id: 'D4W-6', code: 'D4W' }];
      // setThisPlayerDeck(testDeck);

      setPlayers(updatedPlayers);
      setCardsPile(cardsPile);
      setThisPlayerDeck(thisPlayer?.deck || []); // Comment if testing deck array
      setShowLobby(false);
      setActiveAction("uno");

      if (devMode) {
        console.log("Game started!");
        console.log("All players data:", updatedPlayers);
        console.log("Shuffled players data:", shuffledPlayers);
        console.log("This Player test:", thisPlayer);
        console.log("This player deck:", thisPlayer?.deck);
        console.log("The Enemies players:", testEnemiesDeck);
        console.log("Updated Cards pile:", cardsPile);
      }
    };

    socket.current.on("gameStarted", handleGameStarted);

    return () => {
      socket.current?.off("gameStarted", handleGameStarted);
    };
  }, []);


  const handleStartGame = () => {
    const shuffledCards = shuffleArray(packOfCards());
    const cardsPile = [...shuffledCards];

    const deckWithIds = cardsPile.map((code, index) => ({
      id: `${code}-${index}`,
      code,
    }));

    const updatedPlayers = players.map((player) => ({
      ...player,
      deck: deckWithIds.splice(0, 7),
    }));

    // Test
    const shuffledPlayers = shuffleArray([...updatedPlayers]);

    socket.current?.emit("startGame", {
      roomCode,
      updatedPlayers,
      shuffledPlayers,
      cardsPile: deckWithIds,
    });
  };

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
            {leftEnemies.map((player, index) => (
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
              {topEnemies.map((player, index) => (
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

            <div className="centerDisplay flex-1 flex items-center justify-center bg-green-100 rounded">
              <div>Played Cards</div>
              <div><CardAsset code="Deck" size={150} /></div>
            </div>
          </div>

          <div className="rightEnemies flex flex-col justify-center items-center w-[15%] bg-orange-600">
            {rightEnemies.map((player, index) => (
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

        <div className="youDisplay h-[35%] flex flex-col justify-center items-center bg-green-600">
          <div className="player-card flex">
            <div className="flex flex-row">
              {thisPlayerDeck.map(({ id, code }) => (
                <div key={id} className="flex flex-row items-center m-[2px] cursor-pointer">
                  <CardAsset code={code} size={90} />
                  {/* <span className="text-white text-xs">{code}</span> */}
                </div>
              ))}
            </div>
          </div>
          {activeAction === "uno" && (
            <div className="uno flex h-[35%] flex-row items-center">
              <button className="inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 m-1 font-medium text-white hover:bg-neutral-700 focus:ring-[#928E8F] focus:ring-offset-2">
                Uno!
              </button>
              <button className="inline-flex h-12 w-[500px] items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 m-1 font-medium text-white hover:bg-neutral-700 focus:ring-[#928E8F] focus:ring-offset-2">
                You didn't say Uno
              </button>
            </div>
          )}
          {activeAction === "color" && (
            <div className="pickColor flex h-[35%] flex-row items-center">
              <button className="inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-l-xl border-neutral-900 bg-[#EA323C] px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2">
                Red
              </button>
              <button className="inline-flex h-12 w-[120px] items-center justify-center gap-3 border-neutral-900 bg-[#33984B] px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2">
                Green
              </button>
              <button className="inline-flex h-12 w-[120px] items-center justify-center gap-3 border-neutral-900 bg-[#0098DC] px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2">
                Blue
              </button>
              <button className="inline-flex h-12 w-[120px] items-center justify-center gap-3 rounded-r-xl border-neutral-900 bg-[#FFC825] px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2">
                Yellow
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
