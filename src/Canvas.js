import React, { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";

const generator = rough.generator();

const Canvas = ({ canvasRef, ctx, color, setElements, elements, tool, socket, user }) => {
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return; // Ensure canvasRef is not null

    const canvas = canvasRef.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = color;
    context.lineWidth = 5;
    ctx.current = context;
  }, []);

  useEffect(() => {
    if (ctx.current) {
      ctx.current.strokeStyle = color;
    }
  }, [color]);

  useEffect(() => {
    socket.on("canvasState", (data) => {
      if (data.roomId === user.roomId && canvasRef.current && ctx.current) {
        const img = new Image();
        img.src = data.image;
        img.onload = () => {
          ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.current.drawImage(img, 0, 0);
        };
      }
    });
  }, [socket, user.roomId]);

  useLayoutEffect(() => {
    if (!canvasRef.current || !ctx.current) return;
    const roughCanvas = rough.canvas(canvasRef.current);
    ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    elements.forEach((ele) => {
      if (ele.element === "rect") {
        roughCanvas.draw(
          generator.rectangle(ele.offsetX, ele.offsetY, ele.width, ele.height, {
            stroke: ele.stroke,
            roughness: 0,
            strokeWidth: 5,
          })
        );
      } else if (ele.element === "line") {
        roughCanvas.draw(
          generator.line(ele.offsetX, ele.offsetY, ele.width, ele.height, {
            stroke: ele.stroke,
            roughness: 0,
            strokeWidth: 5,
          })
        );
      } else if (ele.element === "circle") {
        const radius = Math.sqrt(ele.width ** 2 + ele.height ** 2) / 2;
        roughCanvas.draw(
          generator.circle(ele.offsetX, ele.offsetY, radius * 2, {
            stroke: ele.stroke,
            roughness: 0,
            strokeWidth: 5,
          })
        );
      } else if (ele.element === "triangle") {
        const triangle = [
          [ele.offsetX, ele.offsetY],
          [ele.offsetX + ele.width, ele.offsetY + ele.height],
          [ele.offsetX - ele.width, ele.offsetY + ele.height],
        ];
        roughCanvas.draw(
          generator.polygon(triangle, {
            stroke: ele.stroke,
            roughness: 0,
            strokeWidth: 5,
          })
        );
      } else if (ele.element === "pencil") {
        roughCanvas.linearPath(ele.path, {
          stroke: ele.stroke,
          roughness: 0,
          strokeWidth: 5,
        });
      } else if (ele.element === "eraser") {
        ctx.current.clearRect(ele.offsetX, ele.offsetY, 10, 10);
      }
    });

    if (canvasRef.current) {
      const canvasImage = canvasRef.current.toDataURL();
      socket.emit("drawing", { roomId: user.roomId, image: canvasImage });
    }
  }, [elements]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);

    if (tool === "pencil") {
      setElements((prev) => [
        ...prev,
        { offsetX, offsetY, path: [[offsetX, offsetY]], stroke: color, element: tool },
      ]);
    } else if (tool === "eraser" && ctx.current) {
      ctx.current.clearRect(offsetX, offsetY, 10, 10);
    } else {
      setElements((prev) => [
        ...prev,
        { offsetX, offsetY, width: 0, height: 0, stroke: color, element: tool },
      ]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === "eraser") {
      ctx.current.clearRect(offsetX, offsetY, 10, 10);
    } else if (tool === "rect" || tool === "circle" || tool === "triangle") {
      setElements((prevElements) =>
        prevElements.map((ele, index) =>
          index === elements.length - 1
            ? { ...ele, width: offsetX - ele.offsetX, height: offsetY - ele.offsetY }
            : ele
        )
      );
    } else if (tool === "line") {
      setElements((prevElements) =>
        prevElements.map((ele, index) =>
          index === elements.length - 1
            ? { ...ele, width: offsetX, height: offsetY }
            : ele
        )
      );
    } else if (tool === "pencil") {
      setElements((prevElements) =>
        prevElements.map((ele, index) =>
          index === elements.length - 1
            ? { ...ele, path: [...ele.path, [offsetX, offsetY]] }
            : ele
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div
      className="col-md-8 overflow-hidden border border-dark px-0 mx-auto mt-3"
      style={{ height: "500px" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Canvas;
