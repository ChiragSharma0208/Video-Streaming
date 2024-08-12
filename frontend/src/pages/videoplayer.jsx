import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Chip, Box } from "@mui/material";
import "./VideoPlayer.css";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpTwoToneIcon from "@mui/icons-material/ThumbUpTwoTone";

export default function VideoPlayer() {
  const { video_id, name, title } = useParams();
  const [userInfo, setUserInfo] = useState("");
  const [newComment, setNewComment] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [uploadInfo, setUploadInfo] = useState([]);
  const [like, setLike] = useState(false);
  const [sub, setSub] = useState(false);
  const [morevids, setMorevids] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/profile", {
          withCredentials: true,
        });
        const allvids = await axios.get(`/getAllVideos/${video_id}/${name}`);
        const { data } = await axios.get(`/video/${video_id}`);

        setMorevids(allvids.data.rows);
        setUploadInfo(data.rows);
        setUserInfo(response.data);

        response.data.subscriptions.forEach((element) => {
          if (element === data.rows[0].name) {
            setSub(true);
          }
        });
        data.rows.forEach((item) => {
          if (item.liked_user === response.data.name) {
            setLike(true);
          }
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [video_id, name, title, like]);

  const handleCommentSubmit = async () => {
    try {
      const { data } = await axios.post(`/comment/${video_id}`, {
        comment: newComment,
        user_id: userInfo.user_id,
      });

      if (data.error) {
        alert(data.error);
      } else {
        setNewComment("");
        const { data } = await axios.get(`/video/${video_id}`);
        setUploadInfo(data.rows);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditComment = async () => {
    try {
      const { data } = await axios.patch(`/comment/${editCommentId}`, {
        comment: editComment,
      });

      if (data.error) {
        alert(data.error);
      } else {
        setEditComment("");
        setEditCommentId(null);
        const { data } = await axios.get(`/video/${video_id}`);
        setUploadInfo(data.rows);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/subscribe", {
        name: userInfo.name,
        channelName: name,
      });

      if (data.error) {
        alert(data.error);
      } else {
        setSub(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.patch("/unsubscribe", {
        name: userInfo.name,
        channelName: name,
      });

      if (data.error) {
        alert(data.error);
      } else {
        setSub(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async () => {
    try {
      await axios.post(`/like`, {
        name: userInfo.name,
        id: video_id,
      });
      setLike(!like);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUnlike = async () => {
    try {
      await axios.post(`/unlike`, {
        name: userInfo.name,
        id: video_id,
      });
      setLike(!like);
    } catch (err) {
      console.log(err);
    }
  };

  const uniqueComments = Array.from(
    new Set(uploadInfo.map((item) => item.c_id))
  ).map((id) => uploadInfo.find((item) => item.c_id === id));

  return (
    <div className="list-data">
      <div className="video-player-container">
        <div className="video-player-wrapper">
          <video id="videoPlayer" className="video-player" controls>
            <source
              src={`http://localhost:8080/play/${name}/${title}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="tags-section">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {uploadInfo[0]?.tags?.map((tag, index) => (
              <Chip key={index} label={tag} color="primary" />
            ))}
          </Box>
        </div>

        <div className="video-details">
          <h2 className="video-title">{title}</h2>
          <p
            onClick={() => {
              navigate(`/profile/${name}`);
            }}
            className="video-author"
          >
            Uploaded by: <strong>{name}</strong>
          </p>
          <div className="subscribe-button">
            {sub ? (
              <button
                onClick={handleUnsubscribe}
                className="subscribe-btn"
                style={{ background: "blue" }}
              >
                Subscribed
              </button>
            ) : (
              <button onClick={handleSubscribe} className="subscribe-btn">
                Subscribe
              </button>
            )}

            {uploadInfo &&
              uploadInfo.length > 0 &&
              (!like ? (
                <>
                  <ThumbUpTwoToneIcon
                    fontSize="large"
                    onClick={handleLike}
                    color="primary"
                  />
                  {uploadInfo[0].likes}
                </>
              ) : (
                <>
                  <ThumbUpIcon
                    fontSize="large"
                    onClick={handleUnlike}
                    color="primary"
                  />
                  {uploadInfo[0].likes}
                </>
              ))}
          </div>
        </div>

        <div className="user-info">
          <textarea
            id="comment-box"
            placeholder="Leave a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          <button type="button" onClick={handleCommentSubmit}>
            Post Comment
          </button>
        </div>

        <div className="comments-section">
          <h2>Comments{` (${uniqueComments.length})`}</h2>
          {uniqueComments
            .filter((post) => post.comments)
            .reverse()
            .map((post, index) => (
              <div key={index} className="comment">
                <div className="comment-content">
                  <p>{`"${post.comments}"`}</p>
                  <p className="timestamp">{`Posted at: ${new Date(post.updated_at).toLocaleString() || new Date(post.created_at).toLocaleString()}`}</p>
                </div>
                {userInfo.user_id === post.user_id && (
                  <button
                    className="edit-button"
                    onClick={() => {
                      setEditComment(post.comments);
                      setEditCommentId(post.c_id);
                    }}
                  >
                    Edit
                  </button>
                )}
                {editCommentId === post.c_id && (
                  <div className="edit-section">
                  <textarea
                    className="edit-comment-box"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  ></textarea>
                  <div className="edit-buttons">
                    <button className="save-btn" onClick={handleEditComment}>Save</button>
                    <button className="cancel-btn" onClick={() => setEditCommentId(null)}>Cancel</button>
                  </div>
                </div>
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="video-list">
        <h2>More Videos by {name}</h2>
        {morevids.map((video) => (
          <div
            key={`${video.video_id}-${video.title}`}
            onClick={() => {
              navigate(`/play/${video.video_id}/${video.name}/${video.title}`);
              window.location.reload();
            }}
            className="video-thumbnail"
          >
            <img
              src={`http://localhost:8080/${video.path}thumbnail.jpg`}
              alt={video.title}
            />
            <p>{video.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
