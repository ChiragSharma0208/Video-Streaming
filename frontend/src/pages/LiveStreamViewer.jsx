import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import "./LiveStreamViewer.css";
import { useParams } from "react-router-dom";

const LiveStreamViewer = () => {
  const { user } = useParams();
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    const socketClient = io("http://localhost:8080", {
      withCredentials: true,
    });
    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && videoRef.current) {
      const startViewing = async () => {
        try {
          const pc = new RTCPeerConnection();
          setPeerConnection(pc);
  
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              console.log("Sending ICE candidate:", event.candidate);
              socket.emit("ice-candidate", event.candidate);
            }
          };
  
          pc.ontrack = (event) => {
            console.log("Received track:", event.streams[0]);
            if (videoRef.current) {
              videoRef.current.srcObject = event.streams[0];
            }
          };
  
          // Handle incoming offer
          socket.on("offer", async (offer) => {
            console.log("Received offer:", offer);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log("Sending answer:", answer);
            socket.emit("answer", answer);
          });
  
          // Handle incoming ICE candidates
          socket.on("ice-candidate", (candidate) => {
            console.log("Received ICE candidate:", candidate);
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          });
  
          socket.emit("join-stream", { user });
          console.log("Joined stream:", user);
        } catch (error) {
          console.error("Error setting up peer connection:", error);
        }
      };
  
      startViewing();
    }
  }, [socket, user]);
  
  return (
    <div className="container">
      <div className="video-container">
        <video ref={videoRef} autoPlay controls />
      </div>
    </div>
  );
};

export default LiveStreamViewer;
