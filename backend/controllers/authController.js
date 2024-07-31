const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../DB/db");
const fs = require('fs');
const path = require('path');


const { insertRecord, checkRecordExists } = require("../function/function");


const register = async (req, res) => {
  const { email, name, password,about } = req.body;
  console.log(email,name,password,);
  if (!name || !email || !password) {
    res.status(400).json({ error: "Fields cannot be empty!" });
    return;
  }
  try {
    const checkQuery = "SELECT * FROM users WHERE email = $1";
    const checkValues = [email];
    const { rows } = await db.query(checkQuery, checkValues);

    if (rows.length > 0) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }
  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const query =
      "INSERT INTO users (email, name, password,about) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [email, name, hashedPassword,about];

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
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email exists in database
    const query = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      // Email does not exist
      return res.status(401).json({
        error: "Authentication failed. Invalid email or password.",
      });
    }
    user = rows[0];
    const hashedPassword = user.password;
    
    console.log(user);
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Authentication failed. Invalid email or password.",
      });
    }

    jwt.sign(
      { email: user.email, user_id: user.user_id, name: user.name,subscriptions:user.subscriptions,about:user.about },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("Error signing JWT:", err);
          return res.status(500).json({ error: "Failed to authenticate" });
        }
        res
          .cookie("token", token, { httpOnly: true })
          .status(201)
          .json("Logged in successfully");
      }
    );
  } catch (err) {
    console.error("Error authenticating user", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const data = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getUploads=async(req,res)=>{
  try{
    const {rows} = await db.query('select * from uploads')
    res.json(rows)
  }catch(err){
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
}



const getProfile=(req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, process.env.JWT_SECRET, {}, (err, info) => {
    if (err) console.log(err);
    res.json(info);
  });
}

const playVideo=(req, res) => {
  const{user,title}=req.params
  console.log(user,title);

  const video = path.resolve(__dirname, '..');

  const videoPath = path.join(video, `/uploads/${user}/${title}/video.mp4`);
  console.log(videoPath);
  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const range = req.headers.range;

  if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
  } else {
      const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
  }
}



const addComment=async(req,res)=>{
  const {id}=(req.params)
  const {comment}=(req.body)
  console.log(id,comment);
  


  try{
    const {rows} = await db.query(`insert into comments (comments,video_id) values ('${comment}','${id}')`)
    res.json(rows)
  }catch(err){
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }



}
const addLike=async(req,res)=>{

  const {name,id}=(req.body)
 
  


  try{
    const {rows} = await db.query(`insert into likes (liked_user,video_id) values ('${name}','${id}')`)
    await db.query(`update uploads set likes = (select count(*) from likes where video_id=${id}) where video_id=${id};`)

    res.json(rows)
  }catch(err){
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }



}
const unlike=async(req,res)=>{
  const {name,id}=(req.body)
  console.log(name,id);
  


  try{
    const {rows} = await db.query(`delete from likes where liked_user = '${name}'`)
    await db.query(`update uploads set likes = (select count(*) from likes where video_id=${id}) where video_id=${id};`)

    res.json({message:"record deleted"})
  }catch(err){
    console.error("Error executing query", err);
    

}}


const getVideoInfo=async(req,res)=>{
  const {id}=req.params
  console.log(id);

  try {
    const checkQuery = `select u.*,p.*,c.*,l.* from users u left join uploads p on u.name=p.name left join comments c on p.video_id=c.video_id left join likes l on p.video_id=l.video_id where p.video_id= $1`;
    const checkValues = [id];
    const {rows} = await db.query(checkQuery, checkValues);
    res.json({rows});

  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }

}


const subscribe = async (req, res) => {
  const { name, channelName } = req.body;

  try {
    // Update subscriptions in the database
    const updateQuery = `UPDATE users SET subscriptions = ARRAY_APPEND(subscriptions, $1) WHERE name = $2 RETURNING *`;
    const updateValues = [channelName, name];
    const { rows } = await db.query(updateQuery, updateValues);

    // Check if user was found and subscriptions updated
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a new JWT token with updated data
    const user = rows[0];
    jwt.sign(
      {
        email: user.email,
        user_id: user.user_id,
        name: user.name,
        subscriptions: user.subscriptions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("Error signing JWT:", err);
          return res.status(500).json({ error: "Failed to generate token" });
        }
        // Set the new token as a cookie
        res
          .cookie("token", token, { httpOnly: true })
          .status(200)
          .json({ message: "Subscribed successfully", token });
      }
    );
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const unsubscribe = async (req, res) => {
  const { name, channelName } = req.body;
  console.log(name, channelName);

  try {
    // Update subscriptions in the database
    const updateQuery = `UPDATE users SET subscriptions = array_remove(subscriptions, $1) WHERE name = $2 RETURNING *`;
    const updateValues = [channelName, name];
    const { rows } = await db.query(updateQuery, updateValues);

    // Check if user was found and subscriptions updated
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a new JWT token with updated data
    const user = rows[0];
    console.log(user);
    jwt.sign(
      { 
        email: user.email, 
        user_id: user.user_id, 
        name: user.name, 
        subscriptions: user.subscriptions 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("Error signing JWT:", err);
          return res.status(500).json({ error: "Failed to generate token" });
        }
        // Set the new token as a cookie
        res
          .cookie("token", token, { httpOnly: true })
          .status(200)
          .json({ message: "Subscribed successfully", token });
      }
    );
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

  
const getAllVideos=async(req,res)=>{
  const {id,name}=req.params
  try {
    const {rows} = await db.query(`select * from uploads where name ='${name}' and video_id!=${id};`);
    res.json({rows});

  } catch (err) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
}



const getData=async (req, res) => {
  const {name}=req.params
  try {
    const { rows } = await db.query(`SELECT * FROM users where name='${name}'`);
    res.json(rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = { login,getData, getProfile,register,data,getUploads,subscribe,unsubscribe,playVideo,getAllVideos,addComment,getVideoInfo,addLike,unlike };
