"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../utils/userContext";
import { useSearchParams } from "next/navigation";

import Lobby from "../components/lobby";
import PlayerHand from "../components/playerHand";
import CenterDisplay from "../components/topDisplay";

import shuffleArray from "../utils/shuffleArray";
import packOfCards from "../utils/packOfCards";
import CardAsset from "../utils/cardAsset";
import Message from "../components/message"
import TopDisplay from "../components/topDisplay";

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
  const [theEnemiesDeck, setTheEnemiesDeck] = useState<any[]>([]);

  const [showLobby, setShowLobby] = useState(true);
  const [activeAction, setActiveAction] = useState<ActionType>(null); // Set(color) if wild card is played, get back after color is picked
  const [pickingColor, setPickingColor] = useState(false); // For picking color
  const [topEnemies, setTopEnemies] = useState<any[]>([]);
  const [leftEnemies, setLeftEnemies] = useState<any[]>([]);
  const [rightEnemies, setRightEnemies] = useState<any[]>([]);
  const [isFirstCard, setIsFirstCard] = useState(Boolean);
  const [currentCard, setCurrentCard] = useState<string>("");
  const [currentType, setCurrentType] = useState<string>("");
  const [currentColor, setCurrentColor] = useState<string>("");
  const [currentNumber, setCurrentNumber] = useState<string>("");

  const [gameOver, setGameOver] = useState(true);
  const [winner, setWinner] = useState("");
  const [turn, setTurn] = useState("clockwise"); // Turn will be based on shuffledPlayers state using index

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

      setPlayers(updatedPlayers)
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
    console.log("Test here")
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
      setCurrentType(number);
      setCurrentNumber(type);
      console.log("Color chosen:", color);
    };

    socket.current.on("chooseColor", chooseColor);

    return () => {
      socket.current?.off("chooseColor", chooseColor);
    };
  }, [currentCard]);

  // For Card Played
  useEffect(() => {
    if (!socket.current) return;

    const handleCardDraw = ({ color, number, type, code }: any) => {
      setCurrentCard(code);
      setCurrentColor(color);
      setCurrentType(type);
      setCurrentNumber(number);
    };

    socket.current.on("playedCard", handleCardDraw);

    return () => {
      socket.current?.off("playedCard", handleCardDraw);
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
    while (currentCard && currentCard.code.endsWith("W")) {
      cardsPile.push(currentCard);
      currentCard = cardsPile.shift();
    }

    if (!currentCard || !currentCard.code || !gameOnGoing) {
      console.error("No valid first card found");
      return;
    }
    setCurrentCard(currentCard?.code);
    setIsFirstCard(false);

    getCurrentCardInfo(currentCard.code);
  };

  const drawCard = () => {
    let currentCard = cardsPile.shift();
    const drawingPlayerID = socket.current?.id;
    const drawingPlayerDecks = [...thisPlayerDeck, currentCard];
    setThisPlayerDeck(drawingPlayerDecks);

    socket.current?.emit("drawCard", {
      roomCode,
      drawingPlayerDecks,
      drawingPlayerID,
    });
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


  const getCurrentCardInfo = (code: string) => {
    const color = code.slice(-1);
    const number = code.slice(-2, -1);
    const type = code.slice(-3, -2);

    const colorMap: Record<string, string> = {
      R: "Red",
      G: "Green",
      B: "Blue",
      Y: "Yellow",
      W: "Wild",
    };

    const typeMap: Record<string, string> = {
      R: "Reverse Card",
      S: "Skip Card",
      D: "Draw Card",
      _: "Normal Wild Card",
      "": "Normal Color Card",
    };

    const numberMap: Record<string, string> = {
      0: "Number 0 Card",
      1: "Number 1 Card",
      2: type === "D" ? "Draw 2 Cards" : "Number 2 Card",
      3: "Number 3 Card",
      4: type === "D" ? "Draw 4 Cards" : "Number 4 Card",
      5: "Number 5 Card",
      6: "Number 6 Card",
      7: "Number 7 Card",
      8: "Number 8 Card",
      9: "Number 9 Card",
      _: "Normal Wild Card",
    };

    console.log("Current Card:", code);
    console.log("Color:", colorMap[color] || "Unknown");
    console.log("Type:", typeMap[type] || "Unknown");
    console.log("Number:", numberMap[number] || "Unknown");

    setCurrentColor(color);
    setCurrentType(type);
    setCurrentNumber(number);
  };

  const playCard = (code: string) => {
    const color = code.slice(-1);
    const number = code.slice(-2, -1);
    const type = code.slice(-3, -2);

    const isWild = color === "W";
    const isDrawCard = type === "D";
    const isCurrentDrawCard = currentType === "D";

    if (isWild) {
      // Always allow wild cards
      // Conditional Rendering for color selection, choose color first
      setActiveAction("color");
      console.log("Wild card played:", code);
    } else if (isDrawCard && isCurrentDrawCard) {
      // If Draw 2 Card is played to Draw 4 Card
      if (number === currentNumber) {
        console.log("Draw card stacked by number:", code); // Same Draw 2 Card based on number
      } else if (color === currentColor) {
        console.log("Draw card stacked by color:", code); // Same Draw 2 card based on color dependent to selected color
      } else {
        console.log("Can't stack different draw cards unless color matches.");
        return;
      }
    } else if (color === currentColor) {
      console.log("Card played:", code);
    } else if (number === currentNumber) { // For problem have same number for skip and reverse card: "_"
      if (type === currentType) {
        console.log("Card played:", code); // Same number "_" and same type 
      } else {
        console.log("Current Card:", currentCard, currentColor, currentType, currentNumber); // Same number "_" and different type 
        console.log("Trying to play card:", code, color, number, type, isWild);
        console.log("You can't play this card!");
        return;
      }
    } else {
      console.log("Current Card:", currentCard, currentColor, currentType, currentNumber); // No match for everything
      console.log("Trying to play card:", code, color, number, type, isWild);
      console.log("You can't play this card!");
      return;
    }

    setCurrentCard(code);
    setCurrentColor(color);
    setCurrentType(type);
    setCurrentNumber(number);


    socket.current?.emit("playCard", {
      roomCode,
      code,
      color,
      type,
      number,
    });
  };





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
          <PlayerHand gameOnGoing={gameOnGoing} thisPlayerDeck={thisPlayerDeck} activeAction={activeAction} playCard={playCard} chooseColor={chooseColor} />
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
