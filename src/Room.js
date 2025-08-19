// Room.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

// ✅ Copy button icons
const CopyIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1z"></path>
    <path d="M20 5H8a2 2 0 0 0-2 2v14h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h12v14z"></path>
  </svg>
);

const CheckIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"></path>
  </svg>
);

const CopyButton = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      onClick={doCopy}
      aria-label="Copy message"
      className="absolute top-2 right-2 rounded-md p-2 bg-white/80 hover:bg-white shadow transition opacity-80 hover:opacity-100"
      title={copied ? "Copied!" : "Copy"}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
};

const Room = () => {
  const { roomId } = useParams();
  const [contentType, setContentType] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [messages, setMessages] = useState([]);

  // Join the room
  useEffect(() => {
    // Listener for full history (last 5)
    socket.on("room-messages", (msgs) => {
      setMessages(msgs);
      localStorage.setItem("latestMessages_" + roomId, JSON.stringify(msgs));
    });

    // Listener for new single message
    socket.on("room-message", (data) => {
      setMessages((prev) => {
        const updated = [...prev, data].slice(-5); // keep only last 5
        localStorage.setItem("latestMessages_" + roomId, JSON.stringify(updated));
        return updated;
      });
    });

    // Join room AFTER listeners are ready
    socket.emit("join-room", roomId);

    // Load from localStorage if available
    const saved = localStorage.getItem("latestMessages_" + roomId);
    if (saved) {
      setMessages(JSON.parse(saved));
    }

    return () => {
      socket.off("room-messages");
      socket.off("room-message");
    };
  }, [roomId]);

  // Send text
  const handleTextSubmit = () => {
    if (textContent.trim()) {
      socket.emit("room-message", { roomId, type: "text", content: textContent });
      setTextContent("");
    }
  };

  // File upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const payload = {
          roomId,
          type: "file",
          fileType: file.type,
          fileName: file.name,
          data: dataUrl,
        };
        setFileContent(payload);
        socket.emit("room-message", payload);
      };
      reader.readAsDataURL(file);
    }
  };
  console.log(fileContent);
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Room <span className="text-indigo-600">#{roomId}</span>
        </h2>

        {/* Dropdown */}
        <div className="flex justify-center mb-6">
          <select
            value={contentType}
            onChange={(e) => {
              setContentType(e.target.value);
              setTextContent("");
              setFileContent(null);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="text">✍️ Text</option>
            <option value="image">🖼️ Image</option>
            <option value="pdf">📄 PDF</option>
            <option value="document">📑 Document</option>
          </select>
        </div>

        {/* Text input */}
        {contentType === "text" && (
          <div className="flex flex-col">
            <textarea
              className="w-full h-32 border border-gray-300 rounded-lg p-4 text-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              placeholder="Type your message..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
            <button
              onClick={handleTextSubmit}
              className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition self-end"
            >
              Send
            </button>
          </div>
        )}

        {/* File upload */}
        {(contentType === "image" ||
          contentType === "pdf" ||
          contentType === "document") && (
            <div className="flex flex-col items-center">
              <label className="cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition mb-4">
                Upload {contentType.toUpperCase()}
                <input
                  type="file"
                  accept={
                    contentType === "image"
                      ? "image/*"
                      : contentType === "pdf"
                        ? "application/pdf"
                        : ".doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx"
                  }
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

        {/* Preview */}
        {fileContent && (
          <div className="mt-4 w-full text-center">
            {contentType === "image" && (
              <>
                <img
                  src={fileContent.data}
                  alt="Uploaded"
                  className="max-h-96 mx-auto rounded-lg shadow-lg border"
                />
                <a
                  href={fileContent.data}
                  download={fileContent.fileName}
                  className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                >
                  ⬇️ Download Image
                </a>
              </>
            )}
            {contentType === "pdf" && (
              <>
                <embed
                  src={fileContent.data}
                  type="application/pdf"
                  className="w-full h-96 border rounded-lg shadow-lg"
                />
                <a
                  href={fileContent.data}
                  download={fileContent.fileName}
                  className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                >
                  ⬇️ Download PDF
                </a>
              </>
            )}
            {contentType === "document" && (
              <>
                <p className="text-gray-700 text-center font-medium">
                  📑 {fileContent.fileName} uploaded
                </p>
                <a
                  href={fileContent.data}
                  download={fileContent.fileName}
                  className="mt-2 inline-block bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                >
                  ⬇️ Download Document
                </a>
              </>
            )}
          </div>
        )}

        {/* Messages section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Shared in this Room:</h3>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="relative border rounded-lg p-3 shadow-sm bg-gray-50"
              >
                {/* ✅ Copy button */}
                <CopyButton
                  text={
                    msg.type === "text"
                      ? msg.content
                      : msg.fileName || "File"
                  }
                />

                {/* Text */}
                {msg.type === "text" && (
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {msg.content}
                  </p>
                )}

                {/* Image */}
                {/* Image */}
                {/* Image (any type: jpg, jpeg, png, gif, webp, etc.) */}
                {msg.type === "file" && msg.fileType?.startsWith("image/") && (
                  <div className="text-center">
                    <img
                      src={msg.data}
                      alt={msg.fileName}
                      className="max-h-60 rounded-lg mx-auto"
                    />
                    <a
                      href={msg.data}
                      download={msg.fileName}
                      className="mt-2 inline-block bg-green-600 text-white px-3 py-1 rounded-lg shadow hover:bg-green-700 transition"
                    >
                      ⬇️ Download Image
                    </a>
                  </div>
                )}

                {/* PDF */}
                {msg.type === "file" && msg.fileType?.includes("pdf") && (
                  <div className="text-center">
                    <embed
                      src={msg.data}
                      type="application/pdf"
                      className="w-full h-60 border rounded-lg"
                    />
                    <a
                      href={msg.data}
                      download={msg.fileName}
                      className="mt-2 inline-block bg-green-600 text-white px-3 py-1 rounded-lg shadow hover:bg-green-700 transition"
                    >
                      ⬇️ Download PDF
                    </a>
                  </div>
                )}

                {/* Other docs */}
                {msg.type === "file" &&
                  (msg.fileType?.includes("word") ||
                    msg.fileType?.includes("officedocument") ||
                    msg.fileType?.includes("spreadsheet") ||
                    msg.fileType?.includes("presentation") ||
                    msg.fileType?.includes("text")) && (
                    <div className="text-center">
                      <p className="text-gray-700">📑 {msg.fileName} shared</p>
                      <a
                        href={msg.data}
                        download={msg.fileName}
                        className="mt-2 inline-block bg-green-600 text-white px-3 py-1 rounded-lg shadow hover:bg-green-700 transition"
                      >
                        ⬇️ Download Document
                      </a>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
