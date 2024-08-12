import React, { useState, useContext } from 'react';

import { AuthContext } from '../components/authContext';
import { TextField, Button } from '@mui/material';

import './login.css';

export default function Login() {
  const [data, setData] = useState({ user: '', password: '' });
  const { login } = useContext(AuthContext);
 

  const handleLogin = async (e) => {
    e.preventDefault();
    const { user, password } = data;
    const response = await login(user, password);
    console.log(response);
    
  };

  return (
    <div className="form-container">
      <form className="styled-form" onSubmit={handleLogin}>
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
        <Button sx={{ mt: 2 }} type="submit" variant="contained">Sign In</Button>
        <p className="signup">Don't have an account? <a href="/signup">Sign Up</a></p>
      </form>
    </div>
  );
}
