"use client";
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function Game() {
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

        // 👇 emit to server
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
    <div className='flex inset-0 justify-center items-center h-screen w-screen bg-black'>
      Gamepage
      <br />
      {serverMsg ? serverMsg : "Waiting for server..."}
    </div>
  );
}
