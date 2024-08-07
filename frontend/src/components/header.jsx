import React, { useEffect, useState } from "react";
import "./header.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function Header(user) {
  const [username, setUsername] = useState(null);
  const navigate=useNavigate()

  useEffect(() => {
  
      try {
        if (user.username) {
          console.log(user.username);
          setUsername(user.username);
        }
  
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    
  }, [user]);
  
  const handleLive=async()=>{
    
    await axios.post('/api/live', { videoId: username.name, isLive: true });
    navigate(`/live/${username.name}`)

  }
  const logout = async () => {
    try {
      await axios.post("/logout", {
        withCredentials: true,
      });
      setUsername(null);
      toast.success("Looged out successfully")
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return (
    <header className="header">
      <ul className="nav">
        <li>
          <Link to="/" className="logo">
            LOGO
          </Link>
        </li>
      </ul>
      {username ? (
        <ul className="nav">
          <li>
          <Link to="/upload" className="button">
            Upload
          </Link>
        </li>
        <li>
          <Link onClick={handleLive} className="button">
            Go Live
          </Link>
        </li>
        <li>
          <Link to={`/chat/${username.name}`}  className="button">
            Messages
          </Link>
        </li>
          <li>
            <Link onClick={logout} className="button">
              Logout
            </Link>
          </li>
        </ul>
      ) : (
        <ul className="nav">
          <li>
            <Link to="/login" className="button">
              Login
            </Link>
          </li>
          <li>
            <Link to="/signup" className="button">
              Signup
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
