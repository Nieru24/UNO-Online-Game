"use client";
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";
import randomCodeGenerator from "../app/utils/randomCodeGenerator";

export default function Home() {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [serverMsg, setServerMsg] = useState("");

  // For type of connection
  const glitchAddress = "wss://south-yummy-milkshake.glitch.me";
  const localAddress = "http://localhost:8080";

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(localAddress, {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Connected to server");

        // 👇 Emit to server
        socketRef.current?.emit("pingFromClient", {
          message: "Hello from client!",
        });
      });

      // 👇 Listen for server response
      socketRef.current.on("pongFromServer", (data) => {
        console.log("📥 Received from server:", data);
        setServerMsg(data.message);
      });
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <div className="flex inset-0 justify-center items-center h-screen w-screen bg-black">
      <div className="flex flex-col justify-center items-center h-[500px] w-[500px] bg-[#DBD6D7] p-6 text-black rounded">
        <div className="text border-2 border-solid border-[#928E8F] p-4 rounded-md">
          <div className="title text-3xl text-neutral-900 tracking-tighter text-center font-semibold">
            Uno: Card Game
          </div>
          <div className="subtitle mt-4 font-medium text-base text-neutral-500 text-center">
            something something saying just yaping yaping something something
            saying just yaping yaping
          </div>
        </div>
        <div className="nameInput mt-10 mb-6">
          <input
            className="block h-12 w-[400px] appearance-none rounded-xl bg-white px-4 py-2 text-amber-500 placeholder-neutral-300 focus:outline-hidden focus:ring-neutral-300 sm:text-sm focus:border-2 focus:border-solid focus:border-[#928E8F]"
            id="name"
            placeholder="Your name"
            type="text"
          />
        </div>
        <div className="boxHolder">
          <div className="joinRoom">
            <input
              className="block mb-2 h-12 w-[400px] appearance-none rounded-xl bg-white px-4 py-2 text-amber-500 placeholder-neutral-300 focus:outline-hidden focus:ring-neutral-300 sm:text-sm focus:border-2 focus:border-solid focus:border-[#928E8F]"
              id="name"
              placeholder="Game Code"
              type="text"
            />
            <button
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-[#928E8F] focus:ring-offset-2"
              type="submit"
            >
              Join Game
            </button>
          </div>
          <div className="text-center m-3">Or</div>
          <div className="createRoom">
            <Link href={`/play?roomCode=${randomCodeGenerator(5)}`}>
              <button
                className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white hover:bg-neutral-700 focus:ring-2 focus:ring-black focus:ring-offset-2"
                type="submit"
              >
                Create Game
              </button>
            </Link>
          </div>
        </div>

        {/* {serverMsg ? serverMsg : "Waiting for server..."} */}
      </div>
    </div>
  );
}
