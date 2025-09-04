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
app.get("/", (_, res) => {
  res.json({ id: uuidv4() });
});

// io.on("connection", (socket) => {
//   console.log(`🔗 New client connected: ${socket.id}`);

//   socket.on("join_room", ({ roomId }) => {
//     socket.join(roomId);
//     console.log(roomId);
//     console.log(`Socket ${socket.id} joined room ${roomId}`);
//   });

//   socket.on("game_data", ({ roomId, message }) => {
//     console.log(`💬 Message received for room ${roomId}:`, message);

//     io.to(roomId).emit("receive_data", {
//       sender: socket.id,
//       message,
//     });
//   });
//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//   });
// });

// io.on("connection", (socket) => {
//   console.log(`🔗 New client connected: ${socket.id}`);

//   // Join room event
//   socket.on("joinRoom", ({ roomId }) => {
//     const room = io.sockets.adapter.rooms.get(roomId);
//     const numUsers = room ? room.size : 0;

//     if (numUsers >= 2) {
//       // Room full, reject
//       socket.emit("roomFull", { msg: "Room is full!" });
//       console.log(`Socket ${socket.id} tried to join full room ${roomId}`);
//       return;
//     }

//     // Room has space, join
//     socket.join(roomId);
//     console.log(`Socket ${socket.id} joined room ${roomId}`);

//     // Emit current users count to the room
//     const updatedRoom = io.sockets.adapter.rooms.get(roomId);
//     io.to(roomId).emit("roomUsers", { count: updatedRoom.size });
//   });

//   // Chat message
//   socket.on("chatMessage", ({ roomId, message }) => {
//     console.log(`💬 Message received for room ${roomId}:`, message);

//     // Broadcast to all users in the room except sender
//     socket.to(roomId).emit("chatMessage", {
//       id: roomId,
//       message,
//     });

//     // Optional: send back to sender too
//     socket.emit("chatMessage", {
//       id: roomId,
//       message,
//     });
//   });

//   // Leave room
//   socket.on("leaveRoom", ({ roomId }) => {
//     socket.leave(roomId);
//     console.log(`Socket ${socket.id} left room ${roomId}`);

//     const room = io.sockets.adapter.rooms.get(roomId);
//     const numUsers = room ? room.size : 0;
//     io.to(roomId).emit("roomUsers", { count: numUsers });
//   });

//   // Handle disconnect
//   socket.on("disconnecting", () => {
//     for (const roomId of socket.rooms) {
//       if (roomId !== socket.id) {
//         const room = io.sockets.adapter.rooms.get(roomId);
//         const numUsers = room ? room.size - 1 : 0;
//         io.to(roomId).emit("roomUsers", { count: numUsers });
//       }
//     }
//     console.log(`❌ Client disconnected: ${socket.id}`);
//   });
// });

// Start server

io.on("connection", (socket) => {
  console.log(`🔗 New client connected: ${socket.id}`);

  socket.on("join_room", ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("game_data", ({ roomId, message }) => {
    console.log(`💬 Message for room ${roomId}:`, message);

    // broadcast only to that room
    io.to(roomId).emit("receive_data", {
      sender: socket.id,
      message,
    });
  });
  socket.on("leave_room", ({ roomId }) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
