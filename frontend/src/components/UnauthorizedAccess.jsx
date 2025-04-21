// UnauthorizedAccess.jsx
import React, { useEffect, useRef } from 'react';

const UnauthorizedAccess = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let x = 50, y = 50;
    let dx = 2, dy = 2;
    const radius = 20;

    function drawBall() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444'; // Tailwind red-500
      ctx.fill();
      ctx.closePath();

      if (x + dx > canvas.width - radius || x + dx < radius) dx = -dx;
      if (y + dy > canvas.height - radius || y + dy < radius) dy = -dy;

      x += dx;
      y += dy;

      requestAnimationFrame(drawBall);
    }

    drawBall();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 animate-fade-in text-center">
        <h1 className="text-4xl font-bold text-red-500 animate-glitch mb-4">
          🔒 Unauthorized Access
        </h1>
        <p className="text-lg mb-6">You shouldn’t be here... but hey, enjoy this mini-game!</p>
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="border-4 border-red-500 rounded-lg shadow-lg"
        ></canvas>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
