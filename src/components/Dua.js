// File: src/components/Dua.js
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { getDuas, addDua, updateDua, deleteDua } from '../services/duaService';
import './Dua.css';

const MAX_CHARACTERS = 250;
const LONG_PRESS_DURATION = 500; // ms

const Dua = () => {
  const { user } = useUser();
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDua, setNewDua] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [editCharCount, setEditCharCount] = useState(0);
  const [swipingId, setSwipingId] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const longPressTimerRef = useRef(null);
  const swipeStartXRef = useRef(0);
  const duaRefs = useRef({});
  const [animation, setAnimation] = useState({ id: null, type: null });

  useEffect(() => {
    const fetchDuas = async () => {
      if (user) {
        try {
          setError(null);
          const userDuas = await getDuas(user.uid);
          setDuas(userDuas);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching duas:", error);
          setError("Failed to load duas. Please try again.");
          setLoading(false);
        }
      }
    };

    fetchDuas();
  }, [user]);

  const handleAddDua = async () => {
    if (!newDua.trim()) return;
    
    try {
      setError(null);
      const duaId = await addDua(user.uid, newDua);
      
      // Animate the new dua
      const newDuaObj = { id: duaId, text: newDua, createdAt: new Date() };
      setDuas(prevDuas => [newDuaObj, ...prevDuas]);
      setAnimation({ id: duaId, type: 'add' });
      
      // Clear form
      setNewDua('');
      setCharCount(0);
      setShowAddForm(false);
      
      // Clear animation after it completes
      setTimeout(() => {
        setAnimation({ id: null, type: null });
      }, 500);
    } catch (error) {
      console.error("Error adding dua:", error);
      setError("Failed to save dua. Please try again.");
    }
  };

  const handleUpdateDua = async (id) => {
    if (!editText.trim()) return;
    
    try {
      setError(null);
      await updateDua(user.uid, id, editText);
      
      setDuas(duas.map(dua => dua.id === id ? { ...dua, text: editText } : dua));
      setAnimation({ id, type: 'update' });
      setEditMode(null);
      setEditText('');
      setEditCharCount(0);
      
      // Clear animation after it completes
      setTimeout(() => {
        setAnimation({ id: null, type: null });
      }, 500);
    } catch (error) {
      console.error("Error updating dua:", error);
      setError("Failed to update dua. Please try again.");
    }
  };

  const handleDeleteDua = async (id) => {
    try {
      setError(null);
      // Start delete animation
      setAnimation({ id, type: 'delete' });
      
      // Wait for animation to complete before removing from UI
      setTimeout(async () => {
        await deleteDua(user.uid, id);
        setDuas(prevDuas => prevDuas.filter(dua => dua.id !== id));
      }, 300);
    } catch (error) {
      console.error("Error deleting dua:", error);
      setError("Failed to delete dua. Please try again.");
    }
  };

  // Touch event handlers for long press
  const handleTouchStart = (dua, e) => {
    e.preventDefault();
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      // Vibrate if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      startEdit(dua);
    }, LONG_PRESS_DURATION);
    
    // For swipe functionality
    swipeStartXRef.current = e.touches[0].clientX;
    setSwipingId(dua.id);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e) => {
    // Cancel long press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Handle swipe
    if (swipingId) {
      const currentX = e.touches[0].clientX;
      const diff = currentX - swipeStartXRef.current;
      
      // Only allow left swipe (negative diff)
      if (diff < 0) {
        // Limit maximum swipe distance
        const newOffset = Math.max(diff, -150);
        setSwipeOffset(newOffset);
      }
    }
  };

  const handleTouchEnd = (dua) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // Handle swipe end
    if (swipingId === dua.id) {
      // If swiped more than halfway, delete the dua
      if (swipeOffset < -75) {
        handleDeleteDua(dua.id);
      } else {
        // Otherwise reset position with animation
        setSwipeOffset(0);
      }
      setSwipingId(null);
    }
  };

  const startEdit = (dua) => {
    setEditMode(dua.id);
    setEditText(dua.text);
    setEditCharCount(dua.text.length);
  };

  const handleNewDuaChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARACTERS) {
      setNewDua(text);
      setCharCount(text.length);
    }
  };

  const handleEditDuaChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARACTERS) {
      setEditText(text);
      setEditCharCount(text.length);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading Duas...</p>
      </div>
    );
  }

  return (
    <div className="dua-container">
      <h1 className="dua-title">O Allah I pray for</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="duas-list">
        {duas.map(dua => (
          <div 
            key={dua.id} 
            ref={el => duaRefs.current[dua.id] = el}
            className={`dua-item ${animation.id === dua.id ? `animation-${animation.type}` : ''}`}
            style={swipingId === dua.id ? { transform: `translateX(${swipeOffset}px)` } : {}}
            onTouchStart={(e) => handleTouchStart(dua, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => handleTouchEnd(dua)}
          >
            {editMode === dua.id ? (
              <div className="edit-dua-form">
                <textarea
                  value={editText}
                  onChange={handleEditDuaChange}
                  className="edit-dua-textarea"
                  rows="4"
                  autoFocus
                />
                <div className="char-counter">
                  {editCharCount}/{MAX_CHARACTERS}
                </div>
                <div className="edit-actions">
                  <button 
                    onClick={() => handleUpdateDua(dua.id)}
                    className="save-btn ripple-effect"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditMode(null)}
                    className="cancel-btn ripple-effect"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="dua-text">{dua.text}</div>
                <div className="swipe-hint">← Swipe left to delete</div>
                <div className="delete-indicator">
                  <span className="delete-icon">🗑️</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {showAddForm ? (
        <div className="add-dua-form animate-in">
          <textarea
            value={newDua}
            onChange={handleNewDuaChange}
            placeholder="Type your dua here..."
            className="add-dua-textarea"
            rows="4"
            autoFocus
          />
          <div className="char-counter">
            {charCount}/{MAX_CHARACTERS}
          </div>
          <div className="add-actions">
            <button 
              onClick={handleAddDua}
              className="add-btn ripple-effect"
              disabled={!newDua.trim()}
            >
              Add Dua
            </button>
            <button 
              onClick={() => {
                setShowAddForm(false);
                setNewDua('');
                setCharCount(0);
              }}
              className="cancel-btn ripple-effect"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="add-dua-prompt pulse-animation"
          onClick={() => setShowAddForm(true)}
        >
          + Tap to Add New / Long press to edit
        </div>
      )}

      <div className="gesture-hints">
        <div className="hint-item">
          <span className="hint-icon">👆</span>
          <span className="hint-text">Long press to edit</span>
        </div>
        <div className="hint-item">
          <span className="hint-icon">👈</span>
          <span className="hint-text">Swipe left to delete</span>
        </div>
      </div>
    </div>
  );
};

export default Dua;