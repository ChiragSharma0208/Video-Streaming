// src/components/authContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile on mount
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('/profile', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const login = async (email, password) => {
    try { 
      const response = await axios.post('/login', { email, password }, { withCredentials: true });
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setUser(response.data); 
        toast.success('Logged in successfully');
        navigate('/');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Username or Password Incorrect');

    
    }
  };

  const logout = async () => {
    try {
      await axios.post('/logout', {}, { withCredentials: true });
      setUser(null); // Clear user state
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
