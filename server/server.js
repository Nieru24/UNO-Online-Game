import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

const app = express();
app.use(cors());
const port = 8080;

app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

app.get("/", (req, res) => {
  res.send("Uno Backend API");
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("joinRoom", ({ roomCode, username }) => {
    socket.join(roomCode);
    console.log(`👥 ${username} joined room: ${roomCode}`);

    socket.data.username = username;
    socket.data.roomCode = roomCode;

    if (!rooms[roomCode]) {
      rooms[roomCode] = [];
    }

    rooms[roomCode].push({ id: socket.id, username });

    const roomOwner = rooms[roomCode][0];
    console.log(`👑 Owner of room ${roomCode} is ${roomOwner.username}`);

    rooms[roomCode].forEach((player) => {
      io.to(player.id).emit("playerListUpdate", {
        realId: player.id,
        players: rooms[roomCode],
        ownerId: roomOwner.id,
      });
    });

    socket.on(
      "startGame",
      ({ roomCode, updatedPlayers, shuffledPlayers, cardsPile }) => {
        io.to(roomCode).emit("gameStarted", {
          updatedPlayers,
          shuffledPlayers,
          cardsPile,
        });
      }
    );

    socket.on(
      "drawCard",
      ({ roomCode, drawingPlayerDecks, drawingPlayerID }) => {
        io.to(roomCode).emit("cardDrawed", {
          drawingPlayerDecks,
          drawingPlayerID,
        });
      }
    );

    socket.on("chooseColor", ({ roomCode, color, number, type }) => {
      io.to(roomCode).emit("chooseColor", {
        color,
        number,
        type,
      });
    });

    socket.on("playCard", ({ roomCode, color, number, type, code, newDeck, playingPlayerID }) => {
      io.to(roomCode).emit("playedCard", {
        color,
        number,
        type,
        code,
        newDeck,
        playingPlayerID,
      });
    });

    // Test
    io.to(roomCode).emit("joinedRoom", {
      message: `${username} has joined room ${roomCode}`,
    });
  });

  socket.on("disconnect", () => {
    const { roomCode, username } = socket.data;

    if (roomCode && rooms[roomCode]) {
      rooms[roomCode] = rooms[roomCode].filter(
        (player) => player.id !== socket.id
      );

      console.log(`❌ ${username} left ${roomCode}`);

      if (rooms[roomCode].length === 0) {
        delete rooms[roomCode];
        console.log(`The room: ${roomCode} is deleted`);
      } else {
        const roomOwner = rooms[roomCode][0]; // new owner
        console.log(`👑 New owner of room: ${roomCode} is ${username}`);
        rooms[roomCode].forEach((player) => {
          io.to(player.id).emit("playerListUpdate", {
            realId: player.id,
            players: rooms[roomCode],
            ownerId: roomOwner.id,
          });
        });
      }
    }
  });
});

server.listen(port, () => {
  console.log(`🖥️  Server is running on PORT: ${port}  ⎛⎝ ≽ > ⩊ < ≼ ⎠⎞`);
});
