import React, { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { auth, provider } from "./firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { v4 as uuid } from "uuid";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const JoinCreateRoom = ({ setUser, setRoomJoined }) => {
  const [step, setStep] = useState("initial");
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("whiteboardUser"));
    if (storedUser) {
      setUser(storedUser);
      setRoomJoined(true);
      navigate(`/room/${storedUser.roomId}`);
    }
  }, []);

  // Admin Login and Generate Room ID
  const handleAdminLogin = async () => {
    try {
      const newRoomId = uuid();

      setRoomId(newRoomId);

      const userData = {
        roomId: newRoomId,
        userId: uuid(),
        host: true,
        presenter: true,
      };

      localStorage.setItem("whiteboardUser", JSON.stringify(userData));
      setUser(userData);
      setRoomId(newRoomId);
      setStep("admin");
    } catch (error) {
      toast.error("Admin Login failed!");
    }
  };

  // User Login and Join Room
  const handleUserLogin = async () => {
    if (!joinRoomId) {
      toast.error("Please enter a valid Room ID!");
      return;
    }
    try {


      const userData = {
        roomId: joinRoomId,
        userId: uuid(),
        host: false,
        presenter: false,
      };

      localStorage.setItem("whiteboardUser", JSON.stringify(userData));
      setUser(userData);
      setRoomJoined(true);
      navigate(`/room/${joinRoomId}`);
    } catch (error) {
      toast.error("User Login failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-gray-800">
         multiShare(QuickShare) Website
      </h1>

      {step === "initial" && (
        <div className="space-y-4 w-full max-w-sm sm:max-w-md">
          <button 
            className="w-full p-3 bg-blue-600 text-white rounded-lg text-lg flex items-center justify-center gap-3"
            onClick={handleAdminLogin}
          >
            <FcGoogle size={24} /> Admin Login
          </button>
          <button 
            className="w-full p-3 bg-green-500 text-white rounded-lg text-lg flex items-center justify-center gap-3"
            onClick={() => setStep("user")}
          >
            User Login
          </button>
        </div>
      )}

      {/* Admin Interface - Generate Room ID */}
      {step === "admin" && (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md sm:max-w-lg">
          <h2 className="text-2xl font-semibold text-center text-blue-600 mb-4">Create ID</h2>
          <p className="text-center text-gray-700 mb-4">Logged in as: <strong>{name}</strong></p>
          
          <div className="flex flex-col sm:flex-row items-center border p-2 rounded mb-4">
            <input type="text" className="flex-1 border-none focus:ring-0 p-2 text-center" value={roomId} readOnly />
            
            <CopyToClipboard text={roomId} onCopy={() => toast.success("Room ID Copied!")}>
              <button className="px-3 py-1 mt-2 sm:mt-0 sm:ml-2 bg-gray-500 text-white rounded">
                Copy
              </button>
            </CopyToClipboard>
          </div>

          <button 
            className="w-full bg-black text-white p-2 rounded" 
            onClick={() => {
              setRoomJoined(true);
              navigate(`/room/${roomId}`);
            }}
          >
            Start Sharing
          </button>
        </div>
      )}

      {/* User Login - Enter Room ID */}
      {step === "user" && (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md sm:max-w-lg">
          <h2 className="text-2xl font-semibold text-center text-green-600 mb-4">Join Room</h2>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            placeholder="Enter ID"
          />
          <button className="w-full bg-green-500 text-white p-2 rounded flex items-center justify-center" onClick={handleUserLogin}>
            <FcGoogle size={20} className="mr-2" /> Join to share
          </button>
        </div>
      )}
    </div>
  );
};

export default JoinCreateRoom;
