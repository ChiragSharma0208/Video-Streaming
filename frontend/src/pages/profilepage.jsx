import PersonIcon from "@mui/icons-material/Person";
import "./profilepage.css";
import React, { useEffect, useState } from "react";
import VideoCard from "../components/videocard.jsx";

import axios from "axios";
import { useParams } from "react-router-dom";

export default function ProfilePage() {
  const { name } = useParams();
  const [username, setUsername] = useState(null);
  const [morevids, setMorevids] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/profile/${name}`, {
          withCredentials: true,
        });
        const allvids = await axios.get(`/getAllVideos/0/${name}`);
        setUsername(response.data);
        console.log(response.data);
        setMorevids(allvids.data.rows);
        console.log(allvids.data.rows); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [name]);
  return (
    <div className="master">
      {username && (
        <>
          <div className="name">
            <div>
              <PersonIcon sx={{ fontSize: 40 }} />
            </div>
            <h2>{name}</h2>
          </div>

          <div>
            <h1>
              <u>About</u>
            </h1>
            {username[0].about}
          </div>
        
          <div>
            <div className="break"></div>
            <div><h1><u>All Videos</u></h1></div>
            <div className="parent">
              {morevids.map((post) => (
                <VideoCard key={post.id} {...post} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
