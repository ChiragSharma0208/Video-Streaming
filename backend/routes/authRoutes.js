const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
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
  getData


} = require("../controllers/authController");

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
  }
});


const upload = multer({
  storage: storage
}).fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]); 


const router = express.Router();

router.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

router.get("/api/uploads",getUploads)
router.post("/subscribe",subscribe)
router.patch("/unsubscribe",unsubscribe)
router.get('/play/:user/:title',playVideo );
router.post("/register", register);
router.post("/login", login);
router.post("/data", data);
router.get("/profile",getProfile)
router.get("/profile/:name",getData)
router.post("/comment/:id",addComment)
router.post("/like",addLike)
router.post("/unlike",unlike)
router.get("/video/:id",getVideoInfo)
router.get("/getAllVideos/:id/:name",getAllVideos)
router.post("/api/upload",(req,res)=>{



  upload(req, res, async function(err) {
    console.log('FormData fields:', req.body);
    console.log('Uploaded files:', req.files.thumbnail[0].destination);
    if(err) {
        console.log(err);
        return res.status(500).send(err);
    }

    try {

      const query =
        "INSERT INTO uploads  ( name, title ,path) VALUES ($1, $2, $3) RETURNING *";
      const values = [req.body.name, req.body.title, req.files.thumbnail[0].destination];
  
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

})

router.post("/logout",(req,res)=>{
  
    res.cookie('token', '').json('ok');
  
})













module.exports = router;
