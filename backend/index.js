const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const db=require("./DB/db")

const app = express();
const port = 8080;

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// PostgreSQL connection setup

// Store connected users
const users = {};

// WebRTC signaling setup
io.on("connection", (socket) => {
  console.log("New client connected");

  // Register user when they join
  socket.on("register", (username) => {
    users[username] = socket.id;
    console.log(`User registered: ${username}`);
  });

  // Handle direct messages and store them in the database
  socket.on("sendMessage", async (data) => {
    const { to, message, from } = data;
    const receiverSocketId = users[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", { message, from });
    }
    // Store the message in the database
    try {
      await db.query(
        `INSERT INTO messages ("from", "to", message, time) VALUES ($1, $2, $3, NOW())`,
        [from, to, message]
      );
      console.log(`Message from ${from} to ${to} stored in the database.`);
    } catch (err) {
      console.error("Error storing message in database:", err);
    }
  });

  // WebRTC signaling setup
  socket.on("offer", (offer) => {
    socket.broadcast.emit("offer", offer);
  });

  socket.on("join-stream", ({ user }) => {
    socket.join(user);
    console.log(`Joined stream: ${user}`);
  });

  socket.on("answer", (answer) => {
    socket.broadcast.emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.broadcast.emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    // Remove user when they disconnect
    for (const [username, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[username];
        console.log(`User disconnected: ${username}`);
        break;
      }
    }
    console.log("Client disconnected");
  });
});

// CORS setup for Express
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", authRoutes);
app.use(express.static(path.join(__dirname, ".")));

// API endpoints
app.get("/ping", (req, res) => res.send("pong !!"));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// Start server
server.listen(port, () =>
  console.log(`Video stream app listening on port ${port}!`)
);
