const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../DB/db");
const {
  register,
  getProfile,
  login,
  data,
  getUploads,
  getVideoInfo,
  subscribe,
  unsubscribe,
  playVideo,
  addComment,
  addLike,
  unlike,
  getAllVideos,
  getData,
  markAsLive,
  editComment,
  getMessages
} = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware");
const errorHandler = require("../middleware/errorHandler");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const username = req.body.name;
    const title = req.body.title;
    const uploadPath = `uploads/${username}/${title}/`;

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}${ext}`);
  },
});

const upload = multer({
  storage: storage,
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

const router = express.Router();

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);


router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

router.use(authenticateToken); 
router.get("/api/uploads", getUploads);
router.post("/subscribe", subscribe);
router.patch("/unsubscribe", unsubscribe);
router.get("/play/:user/:title", playVideo);
router.post("/data", data);
router.get("/profile", getProfile);
router.get("/profile/:name", getData);
router.post("/comment/:id", addComment);
router.post("/like", addLike);
router.post("/unlike", unlike);
router.get("/video/:id", getVideoInfo);
router.get("/getAllVideos/:id/:name", getAllVideos);
router.patch("/comment/:id", editComment);
router.post("/api/upload", (req, res) => {
  upload(req, res, async function (err) {
    console.log("FormData fields:", req.body);
    console.log("Uploaded files:", req.files.thumbnail[0].destination);
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    try {
      const query =
        "INSERT INTO uploads  ( name, title ,path,tags) VALUES ($1, $2, $3, $4) RETURNING *";
      const values = [
        req.body.name,
        req.body.title,
        req.files.thumbnail[0].destination,
        JSON.parse(req.body.tags),
      ];

      const { rows } = await db.query(query, values);

      res.status(201).json({
        status: "success",
        data: {
          user: rows[0],
        },
      });
    } catch (err) {
      console.error("Error inserting data", err);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  });
});

router.post("/api/live", markAsLive);
router.get("/messages/:name", getMessages);

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

router.use(errorHandler);

module.exports = router;
