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

app.get("/", (req, res) => {
  res.send("Uno Backend API");
});

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("joinRoom", ({ roomCode, username }) => {
    socket.join(roomCode);
    console.log(`👥 ${username} joined room: ${roomCode}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ ${socket.data.username || socket.id} disconnected`);

    if (socket.data.roomCode && socket.data.username) {
      io.to(socket.data.roomCode).emit("leftRoom", {
        message: `${socket.data.username} left the room`,
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
