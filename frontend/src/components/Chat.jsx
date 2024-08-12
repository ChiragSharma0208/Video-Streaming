import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./Chat.css";
import { useParams } from "react-router-dom";

const DM = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const { name } = useParams();
  const username = name;
  const [recipients, setRecipients] = useState([]);

  useEffect(() => {
    const socketClient = io("http://localhost:8080");
    setSocket(socketClient);
    socketClient.emit("register", username);

    axios
      .get(`http://localhost:8080/messages/${username}`)
      .then((response) => {
        const data = response.data;
        setMessages(data);
        extractRecipients(data);
        filterMessages(recipient, data); // Filter messages immediately after fetching
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });

    socketClient.on("receiveMessage", (data) => {
      console.log("Received message:", data); // Debugging log
      setMessages((prevMessages) => {
        console.log(data);
        const newMessages = [...prevMessages, data];
        console.log("new messages are ",newMessages);
        extractRecipients(newMessages);
        filterMessages(recipient, newMessages); // Filter messages after receiving a new one
        return newMessages;
      });
      
    });

    return () => {
      socketClient.disconnect();
    };
  }, [username]);

  const extractRecipients = (messages) => {
    const uniqueRecipients = [
      ...new Set(
        messages
          .flatMap((msg) => [msg.to, msg.from])
          .filter((user) => user !== username)
      ),
    ];
    setRecipients(uniqueRecipients);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (socket && recipient && message) {
      const msgData = { to: recipient, message, from: username };
      console.log("Sending message:", msgData); // Debugging log
      socket.emit("sendMessage", msgData);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, msgData];
        console.log("new messages are ",newMessages);
        extractRecipients(newMessages);
        filterMessages(recipient, newMessages); // Filter messages after sending a new one
        return newMessages;
      });
      
      setMessage("");
    }
  };

  const handleRecipientClick = (rec) => {
    setRecipient(rec);
    filterMessages(rec, messages);
  };

  const filterMessages = (rec, allMessages) => {
    if (!rec) {
      console.log("No recipient selected");
      setFilteredMessages([]);
      return;
    }
  
    console.log("Recipient for filtering:", rec);
    console.log("Messages to filter:", allMessages);
  
    const filtered = allMessages.filter(
      (msg) =>
        (msg.from === rec && msg.to === username) ||
        (msg.from === username && msg.to === rec)
    );
  
    console.log("Filtered messages:", filtered);
    setFilteredMessages(filtered);
  };
  

  useEffect(() => {
    if (recipient) {
      filterMessages(recipient, messages);
    }
  }, [messages, recipient]);

  return (
    <div className="dm-container">
      <div className="sidebar">
        <h3>Chats</h3>
        <ul>
          {recipients.map((rec, index) => (
            <li
              key={index}
              className={`recipient ${rec === recipient ? "active" : ""}`}
              onClick={() => handleRecipientClick(rec)}
            >
              {rec}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-area">
        <div className="chat-header">
          <h3>{recipient || "Select a chat"}</h3>
        </div>
        <div className="messages">
          {filteredMessages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.from === username ? "sent" : "received"
              }`}
            >
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient username"
            required
          />
          <div className="sm-container">
            <textarea
              style={{ flex: 1 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              rows="1"
              required
            />
            <button type="submit">Send</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DM;
