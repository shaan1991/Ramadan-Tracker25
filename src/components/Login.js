// File: src/components/Login.js
import React, { useState } from 'react';
import { signInWithGoogle, signInWithApple } from '../services/authService';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // Auth state change will trigger redirect in App.js
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithApple();
      // Auth state change will trigger redirect in App.js
    } catch (error) {
      setError('Failed to sign in with Apple. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="icon-container">
          <span className="moon-icon">☾</span>
          <span className="stars-icon">✧✧</span>
        </div>
        <h1>Asalamuwalekum</h1>
        <h1>Ramadan kareem!</h1>
      </div>
      
      <p className="login-description">
        This app will go away after the month of Ramadan. Here for the month to track the good deeds.
      </p>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="login-buttons">
        <button 
          className="google-button"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
        
        <button 
          className="apple-button"
          onClick={handleAppleSignIn}
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M16.125 0.1875C16.9805 0a2.2075 2.2075 0 0 1-0.5566 1.6113 3.3041 3.3041 0 0 1-1.3711 1.0195c-0.5566-0.5862-0.9309-1.2597-0.8321-1.9629 0.9309-0.0789 1.7813-0.5566 2.7598-0.668zm2.5125 7.7813c-1.3711 0.5862-2.2774 1.5625-2.2774 3.125 0 1.6816 1.4746 3.0274 3.6094 3.0274-0.4032 1.0688-0.75 2.1094-1.4746 3.0274-1.0293 1.4746-2.0586 3.0274-3.6094 3.0274-0.5566 0-1.0195-0.1484-1.4746-0.4375-0.4503-0.293-0.9007-0.4375-1.3711-0.4375-0.5566 0-1.0195 0.1484-1.5039 0.4375-0.4552 0.293-0.8566 0.4375-1.2676 0.4375-1.5625 0-2.7598-1.9629-3.7598-3.4375a12.33 12.33 0 0 1-1.6113-6.0059c0-3.5156 2.2774-5.3711 4.5547-5.3711 0.75 0 1.4746 0.1485 2.0586 0.4375 0.5862 0.2929 1.0186 0.4375 1.5126 0.4375 0.4551 0 0.9102-0.1484 1.4746-0.4375 0.5862-0.293 1.3125-0.4375 2.0625-0.4375 1.3672 0 2.4648 0.5566 3.1698 1.6114z"></path>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Apple'}
        </button>
      </div>
    </div>
  );
};

export default Login;