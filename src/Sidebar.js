import React, { useRef } from "react";
import ChatBox from "./ChatBox";

const Sidebar = ({ users, user, socket, roomId }) => {
  const sideBarRef = useRef(null);
  const overlayRef = useRef(null);

  const openSideBar = () => {
    sideBarRef.current.classList.remove("-translate-x-full");
    overlayRef.current.classList.remove("hidden");
  };

  const closeSideBar = () => {
    sideBarRef.current.classList.add("-translate-x-full");
    overlayRef.current.classList.add("hidden");
  };

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        className="fixed top-4 left-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300 z-50"
        onClick={openSideBar}
      >
        Users
      </button>

      {/* ChatBox */}
      <ChatBox socket={socket} user={user} roomId={roomId} />

      {/* Overlay (for mobile usability) */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 hidden transition-all duration-300"
        onClick={closeSideBar}
      ></div>

      {/* Sidebar */}
      <div
        ref={sideBarRef}
        className="fixed top-0 left-0 h-full w-full max-w-[80%] md:max-w-[50%] lg:max-w-[30%] bg-gray-900 shadow-xl transform -translate-x-full transition-transform duration-300 ease-in-out z-50"
      >
        {/* Close Button */}
        <button
          className="w-full bg-red-500 text-white py-2 hover:bg-red-600 transition-all"
          onClick={closeSideBar}
        >
          Close
        </button>

        {/* User List */}
        <div className="w-full mt-5 px-4">
          {users.map((usr, index) => (
            <p
              key={index}
              className="text-white text-center py-2 bg-gray-800 rounded-md shadow-sm mb-2 hover:bg-gray-700 transition-all"
            >
              {usr.username}
              {usr.id === socket.id && " - (You)"}
            </p>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
