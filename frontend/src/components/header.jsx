import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './authContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import "./header.css";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLive = async () => {
    // Ensure user is logged in before allowing live streaming
    if (user) {
      await axios.post('/api/live', { videoId: user.name, isLive: true });
      navigate(`/live/${user.name}`);
    } else {
      toast.error('You need to be logged in to go live');
    }
  };

  return (
    <header className="header">
      <ul className="nav">
        <li>
          <Link to="/" className="logo">LOGO</Link>
        </li>
      </ul>
      {user ? (
        <ul className="nav">
          <li>
            <Link to="/upload" className="button">Upload</Link>
          </li>
          <li>
            <Link onClick={handleLive} className="button">Go Live</Link>
          </li>
          <li>
            <Link to={`/chat/${user.name}`} className="button">Messages</Link>
          </li>
          <li>
            <Link onClick={logout} className="button">Logout</Link>
          </li>
        </ul>
      ) : (
        <ul className="nav">
          <li>
            <Link to="/login" className="button">Login</Link>
          </li>
          <li>
            <Link to="/signup" className="button">Signup</Link>
          </li>
        </ul>
      )}
    </header>
  );
}
