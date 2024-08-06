const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");

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

// WebRTC signaling setup
io.on("connection", (socket) => {
  console.log("New client connected");

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
