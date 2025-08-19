import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { FaComments, FaTimes } from "react-icons/fa";

const ChatBox = ({ socket, user, roomId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { username: "System", message: "Welcome to the chatroom!,⚠️ Admin must use a desktop to draw on the whiteboard!" },
    {
      username: "System",
      message: "📢 If you have any network issues, please reconnect and refresh the page. Your problem should be resolved. When leaving the whiteboard, please log out; otherwise, the whiteboard will remain active locally. Refreshing the page will clear it."
    }
  ]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    socket.emit("joinRoom", { username: user.userName, roomId: user.roomId });
    toast.info("📢 New Announcement: Please read the system message in the chat.");
    // Ensure only one event listener is attached
    const handleReceiveMessage = (data) => {
      if (data.roomId === user.roomId) {
        setMessages((prev) => [...prev, data]);

        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
          toast.info(`New message from ${data.username}`);
        }
      }
    };

    // Attach the event listener ONCE
    socket.off("receiveMessage").on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.emit("leaveRoom", { username: user.userName, roomId: user.roomId });
    };
  }, [socket, user.roomId]); // Removed `isOpen` to avoid multiple bindings

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() && user.roomId) {
      const msgData = { username: user.userName, message, roomId: user.roomId };
      setMessage("");
      socket.emit("sendMessage", msgData);
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <>
      <button className="fixed bottom-5 right-5 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300" onClick={toggleChat}>
        {unreadCount > 0 && <span className="aabsolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>}
        <FaComments size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-10 right-5 w-[90%] sm:w-96 md:w-[28rem] lg:w-[32rem] bg-gray-900 text-white p-3 rounded-lg shadow-lg transition-all">
          <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
            <h3 className="text-lg font-semibold">Chat</h3>
            <button onClick={toggleChat} className="text-red-400 hover:text-red-600">
              <FaTimes size={20} />
            </button>
          </div>
          <div ref={chatRef} className="h-64 sm:h-72 md:h-80 overflow-y-auto mb-2 p-2 bg-gray-800 rounded">
            {messages.map((msg, index) => (
              <p key={index} className="p-2 rounded mb-1 bg-gray-700 text-sm sm:text-base">
                <strong>{msg.username}:</strong> {msg.message}
              </p>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              className="flex-grow p-2 text-black rounded-l focus:outline-none text-sm sm:text-base"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()} // Allow Enter key to send message
            />
            <button className="bg-green-500 p-2 rounded-r hover:bg-green-600 transition-all" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
