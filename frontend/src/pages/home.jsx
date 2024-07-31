import React, { useEffect, useState } from 'react'
import Header from "../components/header.jsx";
import Index from "../components/index.jsx";
import axios from "axios";
export default function Home() {
  const [username, setUsername] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/profile", {
          withCredentials: true,
        });
        setUsername(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      
      <Header username={username}/>
      <Index  username={username}/>
    </div>
  )
}
