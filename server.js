import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(httpServer, {
  cors: {
    origin: `${process.env.CLIENT_URL}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const MAX_ROOM_SIZE = 2;
const secretKey = "RPS-BY-TOME";

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  const token = jwt.sign(uuidv4(), secretKey);

  res.json({ id: token });
});

app.post("/join-room/:idR", async (req, res) => {
  try {
    const { idR } = req.params;
    const decoded = jwt.verify(idR, secretKey);
    console.log("Decoded ID:", decoded);
    res.json({ idR });
  } catch (err) {
    console.error("Invalid token:", err);
    return res.status(400).json({ error: "Invalid room ID" });
  }
});

io.on("connection", (socket) => {
  // console.log(`🔗 New client connected: ${socket.id}`);

  socket.on("join_room", ({ roomId }) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const ids = room ? [...room] : [];

    if (ids.length >= MAX_ROOM_SIZE + 1) {
      socket.leave(roomId);
      // console.log(`❌ Room ${roomId} is full`);
      socket.emit("room_full", { roomId });
      return;
    }

    socket.join(roomId);
    // console.log(`✅ Socket ${socket.id} joined room ${roomId}`);
    // console.log("Current room members:", [
    //   ...(io.sockets.adapter.rooms.get(roomId) || []),
    // ]);

    if (ids.length === MAX_ROOM_SIZE) {
      // console.log(`💪 ROOM IS READY`);
      // Emit to all sockets in this room
      io.to(roomId).emit("room_ready", { roomId });
    }
  });

  socket.on("game_data", ({ roomId, message }) => {
    console.log(`💬 Message for room ${roomId}:`, message);

    io.to(roomId).emit("receive_data", {
      sender: socket.id,
      message,
    });
  });
  socket.on("leave_room", ({ roomId }) => {
    io.to(roomId).emit("user_left", { userId: socket.id });
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on PORT-${PORT}`);
});
