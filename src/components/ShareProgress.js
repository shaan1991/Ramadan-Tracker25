// src/components/ShareProgress.js
import React, { useRef, useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import html2canvas from 'html2canvas';
import './ShareProgress.css';

const ShareProgress = ({ onClose }) => {
  const { userData } = useUser();
  const shareCardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareReady, setShareReady] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  if (!userData) return null;

  // Calculate progress values
  const completedSalah = userData.namaz ? 
    Object.values(userData.namaz).filter(Boolean).length : 0;
  
  const completedFasts = userData.history ? 
    Object.values(userData.history)
      .filter(day => day.fasting)
      .length : 0;
  
  const completedTaraweeh = userData.history ? 
    Object.values(userData.history)
      .filter(day => day.prayedTaraweeh)
      .length : 0;
  
  const completedJuz = userData.completedJuzs ? 
    userData.completedJuzs.length : 0;

  // Generate the image
  const generateImage = () => {
    if (!shareCardRef.current) return;
    
    setIsGenerating(true);
    
    // Use html2canvas to generate the image
    html2canvas(shareCardRef.current, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true,
      allowTaint: true
    })
    .then(canvas => {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setImageUrl(dataUrl);
      setShareReady(true);
      setIsGenerating(false);
    })
    .catch(error => {
      console.error("Error generating image:", error);
      setIsGenerating(false);
    });
  };

  // Share the image using Web Share API
  const shareImage = () => {
    if (!imageUrl) return;
    
    const caption = "Alhamdulillah! Tracking my Ramadan journey with Ramadan Tracker app.";
    
    if (navigator.share) {
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'ramadan-progress.png', { type: 'image/png' });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              title: 'My Ramadan Progress',
              text: caption,
              files: [file]
            })
            .then(() => onClose())
            .catch(error => {
              console.error("Error sharing:", error);
              downloadImage();
            });
          } else {
            // Text-only share if file sharing not supported
            navigator.share({
              title: 'My Ramadan Progress',
              text: caption + ' #RamadanTracker'
            })
            .then(() => onClose())
            .catch(error => {
              console.error("Error sharing text:", error);
              downloadImage();
            });
          }
        })
        .catch(error => {
          console.error("Error processing image:", error);
          downloadImage();
        });
    } else {
      // Fall back to download if Web Share API not available
      downloadImage();
    }
  };

  // Download the image as fallback
  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'ramadan-progress.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="share-progress-overlay">
      <div className="share-progress-container">
        <h2>Share My Progress</h2>
        
        <div className="share-preview">
          {/* This is the card that will be converted to an image */}
          <div className="share-card" ref={shareCardRef}>
            <h1 className="share-title">Alhumdulillah!</h1>
            <h2 className="share-subtitle">Today I have</h2>
            
            <div className="share-item">
              <div className="share-icon green">
                <span role="img" aria-label="Prayer hands">🙌</span>
              </div>
              <div className="share-info">
                <p className="share-label">Offered Salah</p>
                <p className="share-value">{completedSalah}/5</p>
              </div>
            </div>
            
            <div className="share-item">
              <div className="share-icon blue">
                <span role="img" aria-label="Watermelon">🍉</span>
              </div>
              <div className="share-info">
                <p className="share-label">Completed Fasts</p>
                <p className="share-value">{completedFasts}/30</p>
              </div>
            </div>
            
            <div className="share-item">
              <div className="share-icon yellow">
                <span role="img" aria-label="Prayer beads">📿</span>
              </div>
              <div className="share-info">
                <p className="share-label">Offered Taraweeh</p>
                <p className="share-value">{completedTaraweeh}/30</p>
              </div>
            </div>
            
            <div className="share-item">
              <div className="share-icon gray">
                <span role="img" aria-label="Book">📖</span>
              </div>
              <div className="share-info">
                <p className="share-label">Completed Juz</p>
                <p className="share-value">{completedJuz}/30</p>
              </div>
            </div>
            
            <p className="share-footer">I am using Ramadan Tracker to track my Ramadan progress</p>
          </div>
        </div>
        
        <div className="share-actions">
          {!shareReady ? (
            <button 
              className="generate-btn" 
              onClick={generateImage}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </button>
          ) : (
            <button className="share-btn" onClick={shareImage}>
              Share Image
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareProgress;