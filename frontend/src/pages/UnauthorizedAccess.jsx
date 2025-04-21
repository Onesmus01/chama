import React, { useEffect, useRef, useState } from 'react';

const UnauthorizedAccess = () => {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const jumpSound = new Audio('/sounds/jump.mp3');
    const gameOverSound = new Audio('/sounds/gameover.mp3');

    const henImg = new Image();
    henImg.src = '/images/hen.png';
    const eagleImg = new Image();
    eagleImg.src = '/images/eagle.png';

    let animationId;

    const bird = {
      x: 100,
      y: 200,
      width: 50,
      height: 50,
      gravity: 0.6,
      lift: -10,
      velocity: 0,
      update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
        if (this.y < 0) this.y = 0;
      },
      draw() {
        ctx.filter = 'hue-rotate(160deg)';
        ctx.drawImage(henImg, this.x, this.y, this.width, this.height);
        ctx.filter = 'none';
      },
      reset() {
        this.y = 200;
        this.velocity = 0;
      },
    };

    const eagle = {
      x: canvas.width - 80,
      y: 100,
      width: 60,
      height: 60,
      speed: 1.5,
      update() {
        this.y += this.y < bird.y ? this.speed : -this.speed;
      },
      draw() {
        ctx.filter = 'hue-rotate(160deg)';
        ctx.drawImage(eagleImg, this.x, this.y, this.width, this.height);
        ctx.filter = 'none';
      },
    };

    const clouds = Array.from({ length: 6 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height / 2),
      speed: Math.random() * 0.5 + 0.2,
    }));

    const drawSky = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f0f0f');
      gradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawClouds = () => {
      clouds.forEach(({ x, y }) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.beginPath();
        ctx.arc(x, y, 20, Math.PI * 0.5, Math.PI * 1.5);
        ctx.arc(x + 20, y - 10, 25, Math.PI * 1, Math.PI * 1.85);
        ctx.arc(x + 45, y, 20, Math.PI * 1.5, Math.PI * 0.5);
        ctx.closePath();
        ctx.shadowColor = '#666';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const updateClouds = () => {
      clouds.forEach((cloud) => {
        cloud.x -= cloud.speed;
        if (cloud.x + 60 < 0) {
          cloud.x = canvas.width + 60;
          cloud.y = Math.random() * (canvas.height / 2);
        }
      });
    };

    const detectCollision = () => {
      if (
        bird.x < eagle.x + eagle.width &&
        bird.x + bird.width > eagle.x &&
        bird.y < eagle.y + eagle.height &&
        bird.y + bird.height > eagle.y
      ) {
        if (!gameOver) {
          gameOverSound.play();
        }
        setGameOver(true);
        cancelAnimationFrame(animationId);
        renderGameOver();
      }
    };

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        bird.velocity = bird.lift;
        jumpSound.currentTime = 0;
        jumpSound.play();
      }

      if (e.code === 'KeyR') {
        resetGame();
      }
    };

    const renderGameOver = () => {
      ctx.fillStyle = '#fff';
      ctx.font = '36px Poppins, sans-serif';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText('Game Over', canvas.width / 2 - 90, canvas.height / 2);
      ctx.font = '20px Poppins, sans-serif';
      ctx.fillText('Press R to Restart', canvas.width / 2 - 85, canvas.height / 2 + 40);
    };

    const resetGame = () => {
      bird.reset();
      eagle.y = 100;
      setGameOver(false);
      animationId = requestAnimationFrame(gameLoop);
    };

    const gameLoop = () => {
      drawSky();
      drawClouds();
      updateClouds();

      bird.update();
      bird.draw();

      eagle.update();
      eagle.draw();

      detectCollision();

      if (!gameOver) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    henImg.onload = () => {
      eagleImg.onload = () => {
        gameLoop();
      };
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationId);
    };
  }, [gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
      <div className="rounded-3xl shadow-2xl p-8 text-center bg-white bg-opacity-10 backdrop-blur-2xl border border-white/20">
        <h1 className="text-5xl font-extrabold text-white animate-pulse mb-4 drop-shadow-lg">
          🚫 Unauthorized Access
        </h1>
        <p className="text-lg mb-6 text-white drop-shadow-md">
          You shouldn’t be here... but enjoy this chill mini-game!
        </p>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="rounded-xl border-4 border-white shadow-xl"
        />
        {gameOver && (
          <div className="mt-6">
            <p className="text-xl text-white animate-bounce drop-shadow-md">
              Game Over — Press <span className="font-bold">R</span> to try again!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
