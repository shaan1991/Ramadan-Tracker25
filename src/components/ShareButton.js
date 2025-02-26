// src/components/ShareButton.js
import React, { useState } from 'react';
import ShareProgress from './ShareProgress';
import './ShareButton.css';

const ShareButton = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  
  const handleOpenShare = () => {
    setShowShareModal(true);
  };
  
  const handleCloseShare = () => {
    setShowShareModal(false);
  };
  
  return (
    <>
      <button className="share-button" onClick={handleOpenShare} aria-label="Share progress">
        <span className="share-icon">
          {/* Paper airplane icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      
      {showShareModal && (
        <ShareProgress onClose={handleCloseShare} />
      )}
    </>
  );
};

export default ShareButton;