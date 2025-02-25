// File: src/components/Dua.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getDuas, addDua, updateDua, deleteDua } from '../services/duaService';
import './Dua.css';

const Dua = () => {
  const { user } = useUser();
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDua, setNewDua] = useState('');

  useEffect(() => {
    const fetchDuas = async () => {
      if (user) {
        try {
          const userDuas = await getDuas(user.uid);
          setDuas(userDuas);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching duas:", error);
          setLoading(false);
        }
      }
    };

    fetchDuas();
  }, [user]);

  const handleAddDua = async () => {
    if (!newDua.trim()) return;
    
    try {
      const duaId = await addDua(user.uid, newDua);
      setDuas([...duas, { id: duaId, text: newDua }]);
      setNewDua('');
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding dua:", error);
    }
  };

  const handleUpdateDua = async (id) => {
    if (!editText.trim()) return;
    
    try {
      await updateDua(user.uid, id, editText);
      setDuas(duas.map(dua => dua.id === id ? { ...dua, text: editText } : dua));
      setEditMode(null);
      setEditText('');
    } catch (error) {
      console.error("Error updating dua:", error);
    }
  };

  const handleDeleteDua = async (id) => {
    if (window.confirm("Are you sure you want to delete this dua?")) {
      try {
        await deleteDua(user.uid, id);
        setDuas(duas.filter(dua => dua.id !== id));
      } catch (error) {
        console.error("Error deleting dua:", error);
      }
    }
  };

  const startEdit = (dua) => {
    setEditMode(dua.id);
    setEditText(dua.text);
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
      
      <div className="duas-list">
        {duas.map(dua => (
          <div key={dua.id} className="dua-item">
            {editMode === dua.id ? (
              <div className="edit-dua-form">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-dua-textarea"
                  rows="4"
                />
                <div className="edit-actions">
                  <button 
                    onClick={() => handleUpdateDua(dua.id)}
                    className="save-btn"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditMode(null)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="dua-text">
                {dua.text}
                <div className="dua-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => startEdit(dua)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteDua(dua.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {showAddForm ? (
        <div className="add-dua-form">
          <textarea
            value={newDua}
            onChange={(e) => setNewDua(e.target.value)}
            placeholder="Type your dua here..."
            className="add-dua-textarea"
            rows="4"
          />
          <div className="add-actions">
            <button 
              onClick={handleAddDua}
              className="add-btn"
            >
              Add Dua
            </button>
            <button 
              onClick={() => {
                setShowAddForm(false);
                setNewDua('');
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="add-dua-prompt" onClick={() => setShowAddForm(true)}>
          + Tap to Add New / Long press to edit
        </div>
      )}
    </div>
  );
};

export default Dua;