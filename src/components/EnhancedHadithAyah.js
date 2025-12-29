import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import './EnhancedHadithAyah.css';

const EnhancedHadithAyah = ({ content, type = 'hadith' }) => {
  const { user } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [collections, setCollections] = useState([]);
  const [newCollection, setNewCollection] = useState('');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !content?.id) return;
      try {
        const favRef = doc(db, 'users', user.uid, 'favorites', `${type}_${content.id}`);
        const snapshot = await getDoc(favRef);
        setIsFavorited(snapshot.exists());
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    const loadCollections = async () => {
      if (!user) return;
      try {
        const colRef = collection(db, 'users', user.uid, 'ayahCollections');
        const snapshot = await getDocs(colRef);
        const cols = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCollections(cols);
      } catch (error) {
        console.error('Error loading collections:', error);
      }
    };

    checkFavorite();
    loadCollections();
  }, [user, content?.id, type]);

  const toggleFavorite = async () => {
    if (!user || !content?.id) return;

    try {
      const favRef = doc(db, 'users', user.uid, 'favorites', `${type}_${content.id}`);
      
      if (isFavorited) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, {
          contentId: content.id,
          type,
          content: content.text,
          source: content.source,
          addedAt: new Date(),
          shared: false
        });
      }
      
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const addToCollection = async (collectionId) => {
    if (!user || !content?.id) return;

    try {
      const itemRef = collection(db, 'users', user.uid, 'ayahCollections', collectionId, 'items');
      await addDoc(itemRef, {
        contentId: content.id,
        type,
        content: content.text,
        source: content.source,
        addedAt: new Date()
      });
      setShowCollectionModal(false);
    } catch (error) {
      console.error('Error adding to collection:', error);
    }
  };

  const createNewCollection = async () => {
    if (!user || !newCollection.trim()) return;

    try {
      const colRef = collection(db, 'users', user.uid, 'ayahCollections');
      await addDoc(colRef, {
        name: newCollection,
        description: '',
        createdAt: new Date(),
        itemCount: 0,
        isShared: false
      });
      setNewCollection('');
      setShowNewCollectionForm(false);
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const shareContent = async () => {
    if (!user || !content?.id) return;

    try {
      const favRef = doc(db, 'users', user.uid, 'favorites', `${type}_${content.id}`);
      await setDoc(favRef, { shared: true, sharedAt: new Date() }, { merge: true });
      
      // Share functionality - can be expanded to create shareable links
      const shareText = `Check out this amazing ${type}:\n\n"${content.text}"\n\n- ${content.source}\n\nShared from Ramadan Tracker 2026`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Ramadan Tracker',
          text: shareText
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Content copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };

  return (
    <div className="enhanced-hadith-container">
      <div className="hadith-content">
        <p className="hadith-text">"{content?.text}"</p>
        <p className="hadith-source">— {content?.source}</p>
      </div>

      <div className="hadith-actions">
        <button 
          className={`action-btn ${isFavorited ? 'favorited' : ''}`}
          onClick={toggleFavorite}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorited ? '❤️' : '🤍'} Favorite
        </button>

        <button 
          className="action-btn"
          onClick={() => setShowCollectionModal(true)}
          title="Add to collection"
        >
          📚 Collection
        </button>

        <button 
          className="action-btn"
          onClick={shareContent}
          title="Share with friends"
        >
          📤 Share
        </button>
      </div>

      {showCollectionModal && (
        <div className="modal-overlay" onClick={() => setShowCollectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add to Collection</h3>
            
            <div className="collections-list">
              {collections.length === 0 ? (
                <p className="no-collections">No collections yet</p>
              ) : (
                collections.map(col => (
                  <div
                    key={col.id}
                    className="collection-item"
                    onClick={() => addToCollection(col.id)}
                  >
                    <span className="collection-name">{col.name}</span>
                    <span className="collection-count">{col.itemCount || 0} items</span>
                  </div>
                ))
              )}
            </div>

            {!showNewCollectionForm ? (
              <button 
                className="create-collection-btn"
                onClick={() => setShowNewCollectionForm(true)}
              >
                + Create New Collection
              </button>
            ) : (
              <div className="new-collection-form">
                <input
                  type="text"
                  placeholder="Collection name"
                  value={newCollection}
                  onChange={(e) => setNewCollection(e.target.value)}
                  autoFocus
                />
                <button onClick={createNewCollection} className="save-btn">Save</button>
                <button 
                  onClick={() => setShowNewCollectionForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            )}

            <button 
              className="close-modal-btn"
              onClick={() => setShowCollectionModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedHadithAyah;
