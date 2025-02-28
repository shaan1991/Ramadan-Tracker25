// File: src/components/Tasbeeh.js
import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './Tasbeeh.css';



const Tasbeeh = () => {
  const [count, setCount] = useState(0);
  const [showRipple, setShowRipple] = useState(false);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const counterRef = useRef(null);
  const { user, userData, updateUserData } = useUser();
  

  // Load the tasbeeh count from Firebase when component mounts
  useEffect(() => {
    if (userData && userData.tasbeeh) {
      setCount(userData.tasbeeh.count || 0);
    }
  }, [userData]);

  // Save the count to Firebase when it changes
  useEffect(() => {
    if (user && count > 0) {
      const saveCount = async () => {
        await updateUserData({
          tasbeeh: {
            count,
            lastUpdated: new Date().toISOString()
          }
        });
      };
      
      // Debounce the save operation to reduce writes to Firebase
      const timerId = setTimeout(() => {
        saveCount();
      }, 1000);
      
      return () => clearTimeout(timerId);
    }
  }, [count, user, updateUserData]);

  const handleIncrement = (event) => {
    // Increment the counter
    setCount(prevCount => prevCount + 1);
    
    // Calculate ripple position for the animation
    if (counterRef.current) {
      const rect = counterRef.current.getBoundingClientRect();
      setRipplePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
    
    // Show ripple effect
    setShowRipple(true);
    
    // Hide ripple after animation completes
    setTimeout(() => {
      setShowRipple(false);
    }, 600); // Match this with the CSS animation duration
  };

  const handleReset = () => {
    setCount(0);
    
    // Save the reset count to Firebase
    if (user) {
      updateUserData({
        tasbeeh: {
          count: 0,
          lastUpdated: new Date().toISOString(),
          lastReset: new Date().toISOString()
        }
      });
    }
  };

  

  return (
    <div className="tasbeeh-container">
      <h1 className="tasbeeh-title">Tasbeeh</h1>
      
      <button className="reset-button" onClick={handleReset}>
        
        Reset
      </button>
      
     


      <div 
        className="counter-area" 
        ref={counterRef}
        onClick={handleIncrement}
      >
        <div className="counter-number">{count}</div>
        <div className="tap-instruction">Tap to count</div>
        
        {showRipple && (
          <div 
            className="ripple" 
            style={{ 
              left: `${ripplePosition.x}px`, 
              top: `${ripplePosition.y}px` 
            }}
          />
        )}
      </div>
      
    </div>
  );
  
};



export default Tasbeeh;