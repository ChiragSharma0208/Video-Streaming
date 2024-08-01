import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import toast from "react-hot-toast";
import "./login.css";

export default function Login() {
  const [data, setData] = useState({
    user: "",
    password: "",
  });
  const path="../../public/cover.jpg"

  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
    const { user, password } = data;
    try {
      const { data } = await axios.post("/login", {
        email: user,
        password: password,
      });

      if (data.error) {
        toast.error(data.error);
      } else {
        setData({});
        toast.success("Logged in successfully");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      toast.error("Username or Password Incorrect")
    }
  };

  return (
    <div className="form-container">
      <form className="styled-form" onSubmit={loginUser}>
        <h1>Holla, Welcome Back</h1>
        <TextField
          type="email"
          id="filled-basic"
          label="Username"
          margin="normal"
          variant="filled"
          value={data.user}
          placeholder="Enter username"
          onChange={(e) => setData({ ...data, user: e.target.value })}
        />
        <TextField
          id="filled-basic"
          label="Password"
          margin="normal"
          variant="filled"
          type="password"
          value={data.password}
          placeholder="Enter Password"
          onChange={(e) => setData({ ...data, password: e.target.value })}
        />
      
        <Button sx={{ mt: 2 }} type="submit" variant="contained">
          Sign In
        </Button>
        <p className="signup">
          Don't have an account? <a href="/signup"><strong>Sign Up</strong></a>
        </p>
      </form>
      <div className="image-container">
       
        
      <img src="cover.jpg" alt="Welcome illustration"/>

      </div>
    </div>
  );
}
