// File: src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';

// Components
import Login from './components/Login';
import Home from './components/Home';
import Tasbeeh from './components/Tasbeeh';
import Dua from './components/Dua';  // New component
import BottomNavigation from './components/BottomNavigation';

// Styles
import './App.css';

const AppContent = () => {
  const { user, loading } = useUser();

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
      <Routes>
        <Route path="/" element={user ? <Home /> : <Login />} />
        <Route path="/tasbeeh" element={user ? <Tasbeeh /> : <Login />} />
        <Route path="/dua" element={user ? <Dua /> : <Login />} />  {/* New route */}
      </Routes>
      {user && <BottomNavigation />}
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;