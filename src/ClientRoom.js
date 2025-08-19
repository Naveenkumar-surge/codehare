import React from "react";
import { useParams } from "react-router-dom";
import Room from "./Room"; 

const ClientRoom = ({ userNo, socket, setUsers, setUserNo, user }) => {
  const { roomId } = useParams(); // room id from the URL
  const userRoomId = user?.roomId;
  console.log(userRoomId); 
  console.log(roomId);
  console.log(setUsers);
  console.log(user);// room id assigned to the logged-in user

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Room Render Portal
        </h1>

        {roomId && userRoomId && roomId === userRoomId ? (
          // ✅ Render Room only if client is in the same room as user
          <Room
            userNo={userNo}
            socket={socket}
            setUsers={setUsers}
            setUserNo={setUserNo}
            user={user}
          />
        ) : (
          // ❌ fallback if room mismatch
          <div className="text-center text-red-500 font-semibold text-xl">
            You are not in this room!
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientRoom;
