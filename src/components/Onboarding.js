// src/components/Onboarding.js
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './Onboarding.css';

const Onboarding = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { updateUserData } = useUser();
  
  const pages = [
    {
      title: "Welcome to Ramadan Tracker",
      description: "Your companion for a blessed month of Ramadan",
      icon: "🌙",
      features: [
        { icon: "🙌", text: "Track your daily prayers" },
        { icon: "🍉", text: "Monitor your fasting" },
        { icon: "📖", text: "Record Quran reading progress" },
        { icon: "🕌", text: "Keep track of Taraweeh prayers" }
      ]
    },
    {
      title: "Features at a Glance",
      description: "Everything you need for your Ramadan journey",
      icon: "✨",
      features: [
        { icon: "📿", text: "Digital tasbeeh counter" },
        { icon: "🔥", text: "Build streaks with consistent worship" },
        { icon: "📝", text: "Record personal duas" },
        { icon: "⏰", text: "Qibla Finder and More" }
      ]
    }
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    // Mark onboarding as completed in user data
    await updateUserData({
      onboardingCompleted: true,
      onboardingCompletedDate: new Date().toISOString()
    });
    
    // Notify parent component
    onComplete();
  };

  const currentPageData = pages[currentPage];

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="onboarding-icon">{currentPageData.icon}</div>
        <h1 className="onboarding-title">{currentPageData.title}</h1>
        <p className="onboarding-description">{currentPageData.description}</p>
        
        <div className="features-list">
          {currentPageData.features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-icon">{feature.icon}</span>
              <span className="feature-text">{feature.text}</span>
            </div>
          ))}
        </div>
        
        <div className="pagination">
          {pages.map((_, index) => (
            <div 
              key={index} 
              className={`pagination-dot ${index === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(index)}
            ></div>
          ))}
        </div>
        
        <button 
          className="next-button" 
          onClick={handleNext}
        >
          {currentPage < pages.length - 1 ? 'Next' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;