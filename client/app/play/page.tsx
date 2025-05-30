"use client";
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../utils/userContext";
import { useSearchParams } from "next/navigation";

export default function Game() {
  const socket = useRef<Socket | null>(null);

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

    return () => {
      socket.current?.disconnect();
    };
  }, [roomCode, username]);

  return (
    <div className="text-white bg-black h-screen w-screen flex flex-col items-center justify-center">
      <h1>Welcome to Room: {roomCode}</h1>
      <h2>Player: {username}</h2>
    </div>
  );
}
