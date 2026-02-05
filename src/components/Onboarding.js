// src/components/Onboarding.js
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './Onboarding.css';

const Onboarding = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { updateUserData } = useUser();
  
  const pages = [
    {
      title: "Welcome to Your Daily Tracker",
      description: "Built for everyday worship, with a special Ramadan focus.",
      icon: "🌙",
      features: [
        { icon: "🤲", text: "Prayer tracking with a simple daily check-in" },
        { icon: "🍉", text: "Fasting and Taraweeh toggles with streaks" },
        { icon: "📖", text: "Qur'an Juz progress and daily totals" },
        { icon: "📅", text: "Calendar to backfill missed days" }
      ]
    },
    {
      title: "Daily Inspiration",
      description: "Small guidance that keeps you grounded each day.",
      icon: "✨",
      features: [
        { icon: "🌿", text: "Suggested Sunnah of the day with completion" },
        { icon: "🕌", text: "Hadith of the day for reflection" },
        { icon: "🔥", text: "Achievements for milestones and consistency" },
        { icon: "📿", text: "Tasbeeh counter for dhikr" }
      ]
    },
    {
      title: "Personalize Your Ramadan",
      description: "Keep dates accurate and streaks meaningful.",
      icon: "🧭",
      features: [
        { icon: "🗓️", text: "Ramadan countdown + length (29/30)" },
        { icon: "📍", text: "Region‑based dates with manual override" },
        { icon: "📝", text: "Save personal duas" },
        { icon: "✨", text: "Separate Ramadan vs everyday achievements" }
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
