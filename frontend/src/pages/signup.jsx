import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import "./login.css";

import toast from "react-hot-toast";
import { useDarkMode } from "../components/DarkModeContext";
export default function Signup() {
  const [data, setData] = useState({
    user: "",
    email: "",
    password: "",
    about: "",
  });

  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  const registerUser = async (e) => {
    e.preventDefault();
    const { user, password, email, about } = data;
    console.log(data);
    try {
      const { data } = await axios.post("/register", {
        name: user,
        email: email,
        password: password,
        about: about,
      });

      if (data.error) {
        toast.error(data.error);
      } else {
        setData({});
        toast.success("Registered successfully");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className={darkMode ? "dark-mode" : "light-mode"}>
      <div className="form-container">
        <form className="styled-form" onSubmit={registerUser}>
          <h1> SIGN UP</h1>
          <TextField
            id="filled-basic"
            label="Username"
            margin="normal"
            variant="filled"
            value={data.user}
            onChange={(e) => {
              setData({ ...data, user: e.target.value });
            }}
          />
          <TextField
            id="filled-basic"
            label="About"
            margin="normal"
            variant="filled"
            value={data.about}
            onChange={(e) => {
              setData({ ...data, about: e.target.value });
            }}
          />

          <TextField
            id="filled-basic"
            label="E-mail"
            type="email"
            margin="normal"
            variant="filled"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
          <TextField
            id="filled-basic"
            label="Password"
            margin="normal"
            variant="filled"
            type="password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
          <Button sx={{ mt: 2 }} type="submit" variant="contained">
            Submit
          </Button>
          <p className="signup">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
