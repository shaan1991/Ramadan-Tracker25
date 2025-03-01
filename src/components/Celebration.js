// src/components/Celebration.js
import React, { useEffect, useState } from 'react';
import './Celebration.css';

const Celebration = ({ onComplete }) => {
  const [confetti, setConfetti] = useState([]);
  
  // Generate random confetti pieces with different colors
  useEffect(() => {
    const colors = [
      '#FF5252', // Red
      '#FFEB3B', // Yellow
      '#2196F3', // Blue
      '#4CAF50', // Green
      '#9C27B0', // Purple
      '#FF9800'  // Orange
    ];
    
    const newConfetti = [];
    for (let i = 0; i < 100; i++) {
      const left = Math.random() * 100;
      const width = Math.random() * 10 + 5;
      const height = Math.random() * 10 + 5;
      const delay = Math.random() * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      newConfetti.push({ id: i, left, width, height, delay, color });
    }
    
    setConfetti(newConfetti);
    
    // Clean up after animation completes
    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [onComplete]);
  
  return (
    <div className="celebration-container">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            width: `${piece.width}px`,
            height: `${piece.height}px`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`
          }}
        />
      ))}
      
      <div className="celebration-message">
        <span className="clap-emoji">👏</span> MashaAllah! <span className="clap-emoji">👏</span>
        <br />All 5 prayers completed!
      </div>
    </div>
  );
};

export default Celebration;