import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "./videocard.jsx";
import './index.css'

export default function Index({ username }) {
  const [posts, setPosts] = useState([]);
  const [sub, setSub] = useState([]);
  const [flag, setFlag] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/uploads");
        console.log(data);
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

  return (
    <>
      <div className="navbar">
        <p onClick={() => setFlag(true)} className={flag ? 'active' : ''}><strong>ALL</strong></p>
        <p onClick={() => setFlag(false)} className={!flag ? 'active' : ''}><strong>SUBSCRIBED</strong></p>
      </div>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search..." 
          value={search} 
          onChange={handleSearchChange} 
        />
      </div>

      <div className="parent">
        {filteredPosts.map(post => (
          <VideoCard key={post.id} {...post} />
        ))}
      </div>
    </>
  );
}
