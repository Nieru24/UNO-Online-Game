"use client";
import React, { useState } from "react";
import Link from "next/link";
import randomCodeGenerator from "../utils/randomCodeGenerator";
import { useUser } from "../utils/userContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [nameInput, setNameInput] = useState("");

  const { setUsername } = useUser();
  const router = useRouter();

  const handleJoinGame = () => {
    if (!nameInput || !roomCode) return alert("Fill out all fields");
    setUsername(nameInput);
    router.push(`/play?roomCode=${roomCode}`);
  };

  const handleCreateGame = () => {
    if (!nameInput) return alert("Enter your name");
    setUsername(nameInput);
    router.push(`/play?roomCode=${randomCodeGenerator(5)}`);
  };

  const buttontwcss =
    "inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2";
  const inputtwcss =
    "block mb-2 h-12 w-[400px] appearance-none rounded-xl bg-white px-4 py-2 text-amber-500 placeholder-neutral-300 focus:outline-hidden focus:ring-neutral-300 sm:text-sm focus:border-2 focus:border-solid focus:border-[#928E8F]";

  return (
    <div className="flex inset-0 justify-center items-center h-screen w-screen bg-black">
      <div className="flex flex-col justify-center items-center h-[500px] w-[500px] bg-[#DBD6D7] p-6 text-black rounded">
        <div className="text border-2 border-solid border-[#928E8F] p-4 rounded-md">
          <div className="title text-3xl text-neutral-900 tracking-tighter text-center font-semibold">
            Uno: Card Game
          </div>
          <div className="subtitle mt-2 font-medium text-base text-neutral-500 text-center">
            something something saying just yaping yaping something something
            saying just yaping yaping
          </div>
        </div>
        <div className="nameInput mt-10 mb-4">
          <input
            className={inputtwcss}
            id="name"
            placeholder="Your name"
            type="text"
            onChange={(event) => setNameInput(event.target.value)}
          />
        </div>
        <div className="boxHolder">
          <div className="joinRoom">
            <input
              className={inputtwcss}
              id="name"
              placeholder="Game Code"
              type="text"
              onChange={(event) => setRoomCode(event.target.value)}
            />

            <button onClick={handleJoinGame} className={buttontwcss}>
              Join Game
            </button>
          </div>
          <div className="text-center m-3">Or</div>
          <div className="createRoom">
            <button onClick={handleCreateGame} className={buttontwcss}>
              Create Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
