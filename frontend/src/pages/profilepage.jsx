import React, { useEffect, useState } from "react";
import PersonIcon from "@mui/icons-material/Person";
import "./profilepage.css";
import VideoCard from "../components/videocard.jsx";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ProfilePage() {
  const { name } = useParams();
  const [username, setUsername] = useState(null);
  const [morevids, setMorevids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/profile/${name}`, { withCredentials: true });
        const allvids = await axios.get(`/getAllVideos/0/${name}`);
        setUsername(response.data);
        setMorevids(allvids.data.rows);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

  return (
    <div className="master">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          {username && (
            <>
              <div className="name">
                <div>
                  <PersonIcon sx={{ fontSize: 60, color: '#3498db' }} />
                </div>
                <h2>{name}</h2>
              </div>

              <div className="about">
                <h1><u>About</u></h1>
                <p>{username[0].about}</p>
              </div>

              <div className="break"></div>

              <div className="videos">
                <h1><u>All Videos</u></h1>
                <div className="parent">
                  {morevids.map((post) => (
                    <VideoCard key={post.id} {...post} />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
