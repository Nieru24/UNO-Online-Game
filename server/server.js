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

  socket.on("pingFromClient", (data) => {
    console.log("📩 Received from client:", data);

    socket.emit("pongFromServer", { message: "Hello from server!" });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User "${socket.id}" disconnected`);
  });
});


server.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
