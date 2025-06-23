"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../utils/userContext";
import { useSearchParams } from "next/navigation";

import Lobby from "../components/lobby";
import PlayerHand from "../components/playerHand";
import Message from "../components/message"
import TopDisplay from "../components/topDisplay";

import shuffleArray from "../utils/shuffleArray";
import packOfCards from "../utils/packOfCards";
import cardRulesHandler from "../utils/cardRulesHandler";
import { Console } from "console";

function GameContent() {
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

  const [players, setPlayers] = useState<{ id: string; username: string; deck?: []; }[]>(
    []
  );
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [showStartButton, setShowStartButton] = useState(Boolean);
  const [gameOnGoing, setGameOnGoing] = useState(false)
  const [cardsPile, setCardsPile] = useState<{ id: string; code: string }[]>(
    []
  ); // Where to draw card/s, everytime player draws, cardsPile shuffle, the last played card gets back to cardsPile
  const [thisPlayerDeck, setThisPlayerDeck] = useState<any[]>([]);

  const [showLobby, setShowLobby] = useState(true);
  const [activeAction, setActiveAction] = useState<ActionType>(null); // Set(color) if wild card is played, get back after color is picked
  const [topEnemies, setTopEnemies] = useState<any[]>([]);
  const [leftEnemies, setLeftEnemies] = useState<any[]>([]);
  const [rightEnemies, setRightEnemies] = useState<any[]>([]);
  const [isFirstCard, setIsFirstCard] = useState(Boolean);
  const [currentCard, setCurrentCard] = useState<string>("");
  const [currentType, setCurrentType] = useState<string>("");
  const [currentColor, setCurrentColor] = useState<string>("");
  const [currentNumber, setCurrentNumber] = useState<string>("");

  const [shuffledPlayers, setShuffledPlayers] = useState<any[]>([]);
  const [rotation, setRotation] = useState<number>(0); // For rotation, 0 for clockwise, 1 for anti-clockwise
  const [playerTurnIndex, setPlayerTurnIndex] = useState<number>(0); // For player turn management
  const [numberCardDraw, setNumberCardDraw] = useState<number>(0); // For number of cards to be draw by player
  const [drawCardPlayed, setDrawCardPlayed] = useState<boolean>(false); // If draw card is played by player


  /* UseEffect */
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

      // For Mapping Card
      const enemiesDeck = shuffledPlayers.filter((p: any) => p.id !== thisPlayerID);
      const leftEnemies = enemiesDeck.filter((_: any, index: number) => index % 3 === 1);
      const topEnemies = enemiesDeck.filter((_: any, index: number) => index % 3 === 0);
      const rightEnemies = enemiesDeck.filter((_: any, index: number) => index % 3 === 2);

      setLeftEnemies(leftEnemies);
      setTopEnemies(topEnemies);
      setRightEnemies(rightEnemies);

      const testDeck = [{ id: 'D4W-0', code: 'D4W' }, { id: 'D4W-1', code: 'D4W' }, { id: 'D4W-2', code: 'D4W' }, { id: 'D4W-3', code: 'D4W' }, { id: 'D4W-4', code: 'D4W' }, { id: 'D4W-5', code: 'D4W' }, { id: 'D4W-6', code: 'D4W' }];
      // setThisPlayerDeck(testDeck);

      setPlayers(updatedPlayers);
      setShuffledPlayers(shuffledPlayers);
      setCardsPile(cardsPile);
      setThisPlayerDeck(thisPlayer?.deck || []); // Comment if testing deck array
      setShowLobby(false);
      setActiveAction("uno");
      setIsFirstCard(true)
      setGameOnGoing(true);

      if (devMode) {
        console.log("Game started!");
        console.log("All players data:", updatedPlayers);
        // console.log("Shuffled players data:", shuffledPlayers);
        // console.log("This Player:", thisPlayer);
        // console.log("This player deck:", thisPlayer?.deck);
        // console.log("The Enemies players:", enemiesDeck);
      }
    };

    socket.current.on("gameStarted", handleGameStarted);

    return () => {
      socket.current?.off("gameStarted", handleGameStarted);
    };
  }, []);


  // For Card Draw
  useEffect(() => {
    if (!socket.current) return;

    const handleCardDraw = ({ drawingPlayerDecks, drawingPlayerID }: any) => {
      let updatedPlayers = players.map(player => {
        if (player.id === drawingPlayerID) {
          return { ...player, deck: drawingPlayerDecks };
        }
        return player;
      });



      // For Mapping Card
      const thisPlayerID = socket.current?.id;
      const enemiesDeck = updatedPlayers.filter((p: any) => p.id !== thisPlayerID);
      const leftEnemies = enemiesDeck.filter((_: any, index: number) => index % 3 === 1);
      const topEnemies = enemiesDeck.filter((_: any, index: number) => index % 3 === 0);
      const rightEnemies = enemiesDeck.filter((_: any, index: number) => index % 3 === 2);

      setPlayers(updatedPlayers);
      setLeftEnemies(leftEnemies);
      setTopEnemies(topEnemies);
      setRightEnemies(rightEnemies);

      if (devMode) {
        console.log(drawingPlayerID)
        console.log("Updated All Players Data:", players); // Delayed by 1
      }
    };

    socket.current.on("cardDrawed", handleCardDraw);

    return () => {
      socket.current?.off("cardDrawed", handleCardDraw);
    };
  }, [players]); // Problem: Display problem if player has a lot of cards


  // For First Card
  useEffect(() => {
    if (!isFirstCard) return;

    getFirstCard();
    setIsFirstCard(false); // Prevents future runs
  }, [isFirstCard]);


  // For Current Card Test
  useEffect(() => {
    if (!socket.current) return;
    if (!currentColor && !currentType && !currentNumber) return;


    if (devMode) {
      console.log("Color:", currentColor);
      console.log("Type:", currentType);
      console.log("Number:", currentNumber);
      console.log("Updated Cards pile:", cardsPile);
    }
  }, [isFirstCard, currentColor, currentType, currentNumber]);

  // For color selection if Wild Card is played
  useEffect(() => {
    if (!socket.current) return;

    const chooseColor = ({ color, number, type }: any) => {
      setCurrentColor(color);
      setCurrentType(type);
      setCurrentNumber(number);
      console.log("Color chosen:", color);
    };

    socket.current.on("chooseColor", chooseColor);

    return () => {
      socket.current?.off("chooseColor", chooseColor);
    };
  }, [currentCard]);

  // For play card
  useEffect(() => {
    if (!socket.current) return;

    const playCard = ({ code, type, number, color, playerTurnIndex, numberCardDraw, drawCardPlayed }: any) => {
      setCurrentCard(code ?? currentCard);
      setCurrentColor(color ?? currentColor);
      setCurrentType(type ?? currentType);
      setCurrentNumber(number ?? currentNumber);
      setPlayerTurnIndex(playerTurnIndex);
      setNumberCardDraw(numberCardDraw);
      setDrawCardPlayed(drawCardPlayed);
      console.log("Socket Passed:", numberCardDraw);
    };

    socket.current.on("playCard", playCard);

    return () => {
      socket.current?.off("playCard", playCard);
    };
  }, [currentCard]);




  /* Functions */
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

    const shuffledPlayers = shuffleArray([...updatedPlayers]);

    socket.current?.emit("startGame", {
      roomCode,
      updatedPlayers,
      shuffledPlayers,
      cardsPile: deckWithIds,
    });
  };


  const getFirstCard = () => {
    let currentCard = cardsPile.shift();

    // Skip Wild cards as first card
    while (currentCard && currentCard.code.endsWith("W") && currentCard.code.startsWith("DRAW")) {
      cardsPile.push(currentCard);
      currentCard = cardsPile.shift();
    }

    if (!currentCard || !currentCard.code || !gameOnGoing) {
      console.error("No valid first card found");
      return;
    }
    const color = currentCard?.code.slice(-1);
    const number = currentCard?.code.slice(-2, -1);
    const type = currentCard?.code.slice(0, -2);
    setCurrentCard(currentCard?.code);
    setCurrentColor(color);
    setCurrentType(type);
    setCurrentNumber(number);
    setIsFirstCard(false);

  };

  const drawCard = () => {
    const drawingPlayerID = socket.current?.id;
    if (!drawingPlayerID) return;

    if (drawCardPlayed === false) {
      let currentCard = cardsPile.shift();
      const drawingPlayerDecks = [...thisPlayerDeck, currentCard];
      setThisPlayerDeck(drawingPlayerDecks);

      socket.current?.emit("drawCard", {
        roomCode,
        drawingPlayerDecks,
        drawingPlayerID,
      });
    }
    else {
      const drawnCards = [];
      for (let i = 0; i < numberCardDraw; i++) {
        const card = cardsPile.shift();
        if (card) drawnCards.push(card);
      }
      const drawingPlayerDecks = [...thisPlayerDeck, ...drawnCards];
      setThisPlayerDeck(drawingPlayerDecks);

      socket.current?.emit("drawCard", {
        roomCode,
        drawingPlayerDecks,
        drawingPlayerID,
      });

      setNumberCardDraw(0);
      setDrawCardPlayed(false);
    }
  }

  const chooseColor = (colorPicked: string) => {
    const color = colorPicked;
    const type = "_";
    const number = "";
    setActiveAction("uno");

    socket.current?.emit("chooseColor", {
      roomCode,
      color,
      type,
      number,
    });
  }

  // What the freak is this...No use
  // const getCurrentCardInfo = (code: string) => {
  //   const color = code.slice(-1);
  //   const number = code.slice(-2, -1);
  //   const type = code.slice(-3, -2);

  //   const colorMap: Record<string, string> = {
  //     R: "Red",
  //     G: "Green",
  //     B: "Blue",
  //     Y: "Yellow",
  //     W: "Wild",
  //   };

  //   const typeMap: Record<string, string> = {
  //     R: "Reverse Card",
  //     S: "Skip Card",
  //     D: "Draw Card",
  //     _: "Normal Wild Card",
  //     "": "Normal Color Card",
  //   };

  //   const numberMap: Record<string, string> = {
  //     0: "Number 0 Card",
  //     1: "Number 1 Card",
  //     2: type === "D" ? "Draw 2 Cards" : "Number 2 Card",
  //     3: "Number 3 Card",
  //     4: type === "D" ? "Draw 4 Cards" : "Number 4 Card",
  //     5: "Number 5 Card",
  //     6: "Number 6 Card",
  //     7: "Number 7 Card",
  //     8: "Number 8 Card",
  //     9: "Number 9 Card",
  //     _: "Normal Wild Card",
  //   };

  //   console.log("Current Card:", code);
  //   console.log("Color:", colorMap[color] || "Unknown");
  //   console.log("Type:", typeMap[type] || "Unknown");
  //   console.log("Number:", numberMap[number] || "Unknown");

  //   setCurrentColor(color);
  //   setCurrentType(type);
  //   setCurrentNumber(number);
  // };

  const playCard = (code: string) => {
    const result = cardRulesHandler(code, currentType, currentColor, currentNumber, drawCardPlayed);

    console.log(result.message);
    if (result.requiresColor) {
      setActiveAction("color");
    }

    let nextPlayerTurnIndex = playerTurnIndex;
    let nextNumberCardDraw = numberCardDraw;
    let nextDrawCardPlayed = drawCardPlayed;
    let nextRotation = rotation;

    if (result.type === "SKIP") {
      const totalPlayers = players.length;
      if (rotation === 0) {
        nextPlayerTurnIndex = (playerTurnIndex + 2) % totalPlayers;
      } else {
        nextPlayerTurnIndex = (playerTurnIndex - 2 + totalPlayers) % totalPlayers;
      }
      setPlayerTurnIndex(nextPlayerTurnIndex);
      console.log(shuffledPlayers[nextPlayerTurnIndex]);
    }

    if (result.type === "REVS") {
      nextRotation = rotation === 0 ? 1 : 0;
      setRotation(nextRotation);
      console.log("Rotation changed to:", rotation === 0 ? "Anti-clockwise" : "Clockwise");
    }

    if (result.type === "DRAW" && result.number === "2") {
      nextNumberCardDraw = numberCardDraw + 2;
      nextDrawCardPlayed = true;
      setNumberCardDraw(nextNumberCardDraw);
      setDrawCardPlayed(true);
      console.log("Number of cards to draw:", nextNumberCardDraw);
    } else if (result.type === "DRAW" && result.number === "4") {
      nextNumberCardDraw = numberCardDraw + 4;
      nextDrawCardPlayed = true;
      setNumberCardDraw(nextNumberCardDraw);
      setDrawCardPlayed(true);
      console.log("Number of cards to draw:", nextNumberCardDraw);
    }


    setCurrentCard(result.code ?? currentCard);
    setCurrentType(result.type ?? currentType)
    setCurrentNumber(result.number ?? currentNumber);
    setCurrentColor(result.color ?? currentColor);
    socket.current?.emit("playCard", {
      roomCode,
      code: result.code,
      type: result.type,
      number: result.number,
      color: result.color,
      playerTurnIndex: nextPlayerTurnIndex,
      numberCardDraw: nextNumberCardDraw,
      drawCardPlayed: nextDrawCardPlayed,
    });
  }




  return (
    <div className="text-white bg-black h-screen w-screen flex flex-col items-center justify-center relative">
      {showLobby && (
        <Lobby
          roomCode={roomCode}
          players={players}
          showStartButton={showStartButton}
          handleStartGame={handleStartGame}
        />
      )}
      <div className="game flex flex-col h-screen w-screen p-4 gap-2">
        <TopDisplay
          leftEnemies={leftEnemies}
          topEnemies={topEnemies}
          rightEnemies={rightEnemies}
          devMode={devMode}
          gameOnGoing={gameOnGoing}
          currentCard={currentCard}
          drawCard={drawCard}
        />
        <div className="youDisplay h-[35%] flex flex-row justify-center items-center bg-green-600">
          <PlayerHand gameOnGoing={gameOnGoing} thisPlayerDeck={thisPlayerDeck} activeAction={activeAction} chooseColor={chooseColor} playCard={playCard} />
          <Message gameOnGoing={gameOnGoing} />
        </div>
      </div>
    </div>
  );
}

export default function Game() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameContent />
    </Suspense>
  );
}
