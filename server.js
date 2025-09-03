
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
const httpServer = createServer(app);

// Setup CORS for Socket.io + Express
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow all origins, adjust in production
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic REST endpoint
app.get("/", (req, res) => {
  res.json({ message: "Socket.IO server is running!", id: uuidv4() });
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`🔗 New client connected: ${socket.id}`);

  // Example: emit welcome event
  socket.emit("welcome", { msg: "Hello from server!", id: uuidv4() });

  // Example: listen for messages
  socket.on("chatMessage", (data) => {
    console.log("💬 Message received:", data);

    // broadcast to everyone
    io.emit("chatMessage", { id: uuidv4(), text: data });
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
