import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "./videocard.jsx";
import './index.css';
import { Link } from "react-router-dom";

export default function Index({ username }) {
  const [posts, setPosts] = useState([]);
  const [sub, setSub] = useState([]);
  const [flag, setFlag] = useState(true);
  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/uploads");
        setPosts(data);

        if (username && username.subscriptions) {
          setSub(username.subscriptions);
        } else {
          setSub([]);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [username]);

  if (!username || !posts.length) {
    return <div>Loading...</div>;
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const handleFlagChange = (newFlag) => {
    setHidden(true);
    setTimeout(() => {
      setFlag(newFlag);
      setHidden(false);
    }, 500); 
  };

  const filteredPosts = flag 
    ? posts.filter(post => {
        const titleMatch = post.title && post.title.toLowerCase().includes(search);
        const tagMatch = post.tags && post.tags.some(tag => tag.toLowerCase() === search);
        const usernameMatch = post.name && post.name.toLowerCase().includes(search);
        return titleMatch || tagMatch || usernameMatch;
      })
    : posts.filter(post => {
        const isSubscribed = sub.some(subscribedName => post.name === subscribedName);
        const titleMatch = post.title && post.title.toLowerCase().includes(search);
        const tagMatch = post.tags && post.tags.some(tag => tag.toLowerCase() === search);
        const usernameMatch = post.name && post.name.toLowerCase().includes(search);
        return isSubscribed && (titleMatch || tagMatch || usernameMatch);
      });

      const uniqueLivePosts = Array.from(new Set(
        posts
          .filter(post => post.islive)   
          .map(post => post.name)         
      ));

  return (
    <>
      <div className="navbar">
        <p onClick={() => handleFlagChange(true)} className={flag ? 'active' : ''}><strong>ALL</strong></p>
        <p onClick={() => handleFlagChange(false)} className={!flag ? 'active' : ''}><strong>SUBSCRIBED</strong></p>
      </div>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search..." 
          value={search} 
          onChange={handleSearchChange} 
        />
      </div>

      <div className={`parent ${hidden ? 'hidden' : ''}`}>
        {filteredPosts.map(post => (
          <VideoCard key={post.id} {...post} />
        ))}
      </div>


      {uniqueLivePosts.length > 0 && (
        <div className="live-card">
          <h2>Live Now!</h2>
          <p>Check out the live streams below:</p>
          {uniqueLivePosts.map((name, index) => (
            <Link to={`/view/${name}`}>
            <div key={index}>{name} is Live </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
