const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const db = require("./DB/db");

const app = express();
const port = 8080;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

const users = {};
const streamData = {}; 

io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);

  socket.on("register", (username) => {
    users[username] = socket.id;
    console.log(`User registered: ${username} with socket ID: ${socket.id}`);
  });

  socket.on("sendMessage", async (data) => {
    const { to, message, from } = data;
    const receiverSocketId = users[to];
    console.log(`Sending message from ${from} to ${to}`, data);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", { to, message, from });
      console.log(`Message sent to ${to}`);
    } else {
      console.log(`No socket ID found for ${to}`);
    }

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

  socket.on("offer", (offer) => {
    console.log("Received offer from broadcaster:", offer);
    streamData.offer = offer;
    streamData.iceCandidates = []

    console.log("Broadcasting offer to all viewers except sender.");
    socket.broadcast.emit("offer", offer);
  });

  socket.on("join-stream", ({ user }) => {
    console.log(`User ${socket.id} joined stream: ${user}`);
    socket.join(user);

    if (streamData.offer) {
      console.log("Sending stored offer to new viewer.");
      socket.emit("offer", streamData.offer);

      if (streamData.iceCandidates.length > 0) {
        console.log(`Sending ${streamData.iceCandidates.length} stored ICE candidates to new viewer.`);
        streamData.iceCandidates.forEach((candidate) => {
          socket.emit("ice-candidate", candidate);
        });
      }
    } else {
      console.log("No offer available to send to the new viewer.");
    }
  });

  socket.on("answer", (answer) => {
    console.log("Received answer from viewer:", answer);

    console.log("Broadcasting answer to all broadcasters except sender.");
    socket.broadcast.emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    console.log("Received ICE candidate:", candidate);

    if (streamData.iceCandidates) {
      streamData.iceCandidates.push(candidate);
    } else {
      streamData.iceCandidates = [candidate];
    }

    console.log("Broadcasting ICE candidate to peers.");
    socket.broadcast.emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    for (const [username, id] of Object.entries(users)) {
      if (id === socket.id) {
        delete users[username];
        console.log(`User disconnected: ${username}`);
        break;
      }
    }
    console.log("Client disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", authRoutes);
app.use(express.static(path.join(__dirname, ".")));

app.get("/ping", (req, res) => res.send("pong !!"));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

server.listen(port, () =>
  console.log(`Video stream app listening on port ${port}!`)
);
