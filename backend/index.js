const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require("dotenv");
dotenv.config();
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser')

const corsOption = {
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  };
  app.use(cors(corsOption));
  app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", authRoutes);
app.use(express.static(path.join(__dirname, '.')));




const filePath = path.join(__dirname, 'video.mp4');






app.get('/ping', (req, res) => res.send('pong !!'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(port, () => console.log(`Video stream app listening on port ${port}!`));
