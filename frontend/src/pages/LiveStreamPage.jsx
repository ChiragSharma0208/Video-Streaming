import React, { useRef, useState, useEffect } from "react"
import io from "socket.io-client"
import axios from "axios";
import "./LiveStreamPage.css"
import { useNavigate, useParams } from "react-router-dom";

const LiveStreamPage = () => {
  const {user}=useParams()

  const navigate=useNavigate()
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Initialize Socket.io client
    
    const socketClient = io("http://localhost:8080");
    setSocket(socketClient);
    

    // Clean up
    return () => {
      socketClient.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && videoRef.current) {
      const startStreaming = async () => {
        // Get user media
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        videoRef.current.srcObject = mediaStream;

        const pc = new RTCPeerConnection();
        setPeerConnection(pc);

        mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", event.candidate);
          }
        };
        pc.ontrack = (event) => {
          videoRef.current.srcObject = event.streams[0];
        };
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", offer);
      };

      startStreaming();
    }
  }, [socket]);

  const stopStreaming = async() => {
    await axios.post('/api/live', { videoId: user, isLive: false });
    

    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)

    }

    if (peerConnection) {
      peerConnection.close()
      setPeerConnection(null)
      navigate(`/`)
    }
  };

  return (
    <div className="container">
      <div className="video-container">
        <video ref={videoRef} autoPlay muted />
      </div>
      <button className="button" onClick={stopStreaming}>Stop Stream</button>
      {!stream && <div className="message">Streaming has been stopped.</div>}
    </div>
  );
};

export default LiveStreamPage;