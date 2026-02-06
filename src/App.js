// File: src/App.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Styles
import './App.css';

const normalizePath = (rawPath) => {
  if (!rawPath) return '/';
  const trimmed = rawPath.split('?')[0].split('#')[0];
  if (trimmed.length > 1 && trimmed.endsWith('/')) {
    return trimmed.slice(0, -1);
  }
  return trimmed || '/';
};

const AppContent = () => {
  const { user, userData, loading } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

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

  useEffect(() => {
    const handlePopState = () => {
      setPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((nextPath, options = {}) => {
    const normalized = normalizePath(nextPath);
    if (normalized === path) return;
    if (options.replace) {
      window.history.replaceState({}, '', normalized);
    } else {
      window.history.pushState({}, '', normalized);
    }
    setPath(normalized);
  }, [path]);

  useEffect(() => {
    if (!user) return;
    const knownPaths = new Set(['/', '/dua', '/tasbeeh', '/profile']);
    if (!knownPaths.has(path)) {
      navigate('/', { replace: true });
    }
  }, [user, path, navigate]);

  const page = useMemo(() => {
    if (!user) {
      return <Login />;
    }
    switch (path) {
      case '/':
        return <Home />;
      case '/dua':
        return <Dua />;
      case '/tasbeeh':
        return <Tasbeeh />;
      case '/profile':
        return <ProfileScreen onNavigate={navigate} />;
      default:
        return <Home />;
    }
  }, [user, path, navigate]);

  if (loading) {
    return (
      <div className="loading app-loading">
        <div className="loading-mark">☾✧</div>
        <p>Preparing your daily dashboard…</p>
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

      <div key={path} className="page-transition">
        {page}
      </div>
      
      {user && !showOnboarding && (
        <BottomNavigation currentPath={path} onNavigate={navigate} />
      )}
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <PrayerTimesProvider>
        <AppContent />
      </PrayerTimesProvider>
    </UserProvider>
  );
}

export default App;
