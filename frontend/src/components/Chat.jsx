import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./Chat.css";

export default function Chat({ username, receiver }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const socketClient = io("http://localhost:8080");
    setSocket(socketClient);

    socketClient.emit('joinRoom', username);

    socketClient.on('newMessage', (data) => {
      if (data.to === username || data.from === username) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });

    return () => {
      socketClient.disconnect();
    };
  }, [username]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit('sendMessage', {
        from: username,
        to: receiver,
        message: message,
      });
      setMessage(""); // Clear the input after sending
    }
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.from === username ? 'sent' : 'received'}`}>
            <strong>{msg.from}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message here..."
          rows="4"
          cols="50"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
