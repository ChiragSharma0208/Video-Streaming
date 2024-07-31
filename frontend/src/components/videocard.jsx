import React, { useState } from 'react';
import './videocard.css';
import { Link } from 'react-router-dom';

const VideoCard = ({ video_id, name, title, path }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className='parent'>
      <div className={`video-card ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={`/play/${video_id}/${name}/${title}`}>
          <img src={`http://localhost:8080/${path}thumbnail.jpg`} alt={title} className="video-card-thumbnail" />
        </Link>

        {isHovered && (
          <Link to={`/play/${video_id}/${name}/${title}`} className="play-button">
            <i className="fa fa-play"></i>
          </Link>
        )}

        <div className="video-card-info">
          <h3 className="video-card-title">{title}</h3>
          <p className="video-card-channel">{name}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
