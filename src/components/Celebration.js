// src/components/Celebration.js
import React, { useEffect } from 'react';
import './Celebration.css';

const Celebration = ({ onComplete }) => {
  useEffect(() => {
    // Clean up after animation completes
    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1600);
    
    return () => clearTimeout(timeout);
  }, [onComplete]);
  
  return (
    <>
      <div className="celebration-glow" aria-hidden="true" />
      <div className="celebration-toast" role="status" aria-live="polite">
        <div className="celebration-message">
          MashaAllah
          <div className="celebration-subtitle">All 5 prayers completed</div>
        </div>
      </div>
    </>
  );
};

export default Celebration;
