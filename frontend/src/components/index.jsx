import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoCard from "./videocard.jsx";
import './index.css'

export default function Index({ username }) {
  const [posts, setPosts] = useState([]);
  const [sub, setSub] = useState([]);
  const [flag, setFlag] = useState(true);

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

  const filteredPosts = flag ? posts : posts.filter(post =>
    sub.some(subscribedName => post.name === subscribedName)
  );

  return (
    <>
      <div className="navbar">
        <p onClick={() => setFlag(true)} className={flag ? 'active' : ''}><strong>ALL</strong> </p>
        <p onClick={() => setFlag(false)} className={!flag ? 'active' : ''}><strong>SUBSCRIBED</strong></p>
      </div>

      <div className="parent">
        {filteredPosts.map(post => (
          <VideoCard key={post.id} {...post} />
        ))}
      </div>
    </>
  );
}
