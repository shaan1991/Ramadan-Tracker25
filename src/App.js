// File: src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import { PrayerTimesProvider } from './contexts/PrayerTimesContext';

// Components
import Login from './components/Login';
import Home from './components/Home';
import Tasbeeh from './components/Tasbeeh';
import Dua from './components/Dua';
import BottomNavigation from './components/BottomNavigation';
import DayTransitionAlert from './components/DayTransitionAlert';
import AppInitializer from './components/AppInitializer';
import ProfileScreen from './components/ProfileScreen';
import Onboarding from './components/Onboarding'; // Import the new component
import FeaturesShowcase from './components/FeaturesShowcase'; // Import new features page

// Styles
import './App.css';

const AppContent = () => {
  const { user, userData, loading } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if we need to show onboarding when user data loads
  useEffect(() => {
    if (user && userData && !loading) {
      // Show onboarding if the user hasn't completed it yet
      setShowOnboarding(userData.onboardingCompleted !== true);
    }
  }, [user, userData, loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading Ramadan Tracker...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* This component runs initialization code but doesn't render anything */}
      <AppInitializer />
      
      {/* Show onboarding for logged-in users who haven't seen it */}
      {user && showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      
      {/* Day transition alert for when midnight passes */}
      {user && !showOnboarding && <DayTransitionAlert />}
      
      <Routes>
        <Route path="/" element={user ? <Home /> : <Login />} />
        <Route path="/tasbeeh" element={user ? <Tasbeeh /> : <Login />} />
        <Route path="/dua" element={user ? <Dua /> : <Login />} />
        <Route path="/profile" element={user ? <ProfileScreen /> : <Login />} />
        <Route path="/features" element={user ? <FeaturesShowcase /> : <Login />} />
      </Routes>
      
      {user && !showOnboarding && <BottomNavigation />}
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <PrayerTimesProvider>
        <Router>
          <AppContent />
        </Router>
      </PrayerTimesProvider>
    </UserProvider>
  );
}

export default App;