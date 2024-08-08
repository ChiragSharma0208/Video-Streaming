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
      .get(`http://localhost:8080/messages/${name}`)
      .then((response) => {
        const data = response.data;
        setMessages(data);
        extractRecipients(data);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });

    socketClient.on("receiveMessage", (data) => {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, data];
        extractRecipients(newMessages);
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
    if (socket) {
      socket.emit("sendMessage", { to: recipient, message, from: username });
      setMessages((prevMessages) => {
        const newMessages = [
          ...prevMessages,
          { message, from: username, to: recipient },
        ];
        extractRecipients(newMessages);
        return newMessages;
      });
      setMessage("");
    }
  };

  const handleRecipientClick = (rec) => {
    setRecipient(rec);
    filterMessages(rec);
  };

  const filterMessages = (rec) => {
    const filtered = messages.filter(
      (msg) =>
        (msg.from === rec && msg.to === username) ||
        (msg.from === username && msg.to === rec)
    );
    setFilteredMessages(filtered);
  };

  useEffect(() => {
    if (recipient) {
      filterMessages(recipient);
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
          <h3>{recipient}</h3>
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
  />
  <div className="sm-container">
    <textarea
      style={{ flex: 1 }}
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Type a message"
      rows="1"
    />
    <button type="submit">Send</button>
  </div>
</form>


      </div>
    </div>
  );
};

export default DM;
