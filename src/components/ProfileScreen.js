// src/components/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { logOut } from '../services/authService';
import './ProfileScreen.css';
import zelle from '../qr-code/zelle.jpeg'

// QR code images would be imported here
// import indiaQRCode from '../assets/india-qr.png';
// import usaQRCode from '../assets/usa-qr.png';

const ProfileScreen = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [daysRemaining, setDaysRemaining] = useState(29);
  const [dataAvailableUntil, setDataAvailableUntil] = useState('');

  useEffect(() => {
    // Calculate remaining days of Ramadan
    const calculateRamadanDays = () => {
      // Ramadan 2025 is expected to start on Feb 27 and end on March 28
      const ramadanEndDate = new Date('2025-04-01');
      const today = new Date();
      
      // Calculate difference in days
      const diffTime = ramadanEndDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Set days remaining (ensure it's not negative)
      setDaysRemaining(Math.max(0, diffDays));
      
      // Calculate data availability (typically a few days after Ramadan)
      const dataEndDate = new Date('2025-04-02');
      const dataMonth = dataEndDate.toLocaleString('en-US', { month: 'numeric' });
      const dataDay = dataEndDate.toLocaleString('en-US', { day: 'numeric' });
      
      setDataAvailableUntil(`${dataMonth}/${dataDay}`);
    };
    
    calculateRamadanDays();
  }, []);

  const handleSignOut = () => {
    // Show the sign out confirmation dialog
    document.getElementById('signout-dialog').showModal();
  };
  
  const confirmSignOut = async () => {
    try {
      // Close the dialog first
      document.getElementById('signout-dialog').close();
      
      // Then sign out
      await logOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleQiblaFinder = () => {
    window.open('https://qiblafinder.withgoogle.com/intl/en/desktop', '_blank');
  };

  const handleReadQuran = () => {
    window.open('https://quran.com/', '_blank');
  };
  const handleEnglishQuran = () => {
    window.open('https://www.clearquran.com/', '_blank');
  };

  const handleFeedback = () => {
    window.open('https://forms.gle/Pv4Fnd2vVFCyumpt6', '_blank');
    // Replace with your actual feedback form URL
  };

  // New function to invite friends
  const handleInviteFriends = () => {
    const appUrl = 'https://ramadan-tracker.web.app';
    const message = `Check out this amazing Ramadan Tracker app! Track your prayers, fasts, and spiritual journey. Download here: ${appUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Ramadan Tracker App',
        text: message,
        url: appUrl
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      // Copy to clipboard
      navigator.clipboard.writeText(message).then(() => {
        alert('Invite message copied to clipboard! You can now share on WhatsApp or other platforms.');
      });
    }
  };
  

  const handleIndiaDonation = () => {
    // Open donation dialog with India QR
    document.getElementById('india-donation-dialog').showModal();
  };

  const handleUSADonation = () => {
    // Open donation dialog with USA QR
    document.getElementById('usa-donation-dialog').showModal();
  };

  const closeDialog = (dialogId) => {
    document.getElementById(dialogId).close();
  };

  return (
    <div className="profile-screen">
      <div className="profile-content">
        <div className="countdown-section">
          <h2>This App will delete itself after</h2>
          <div className="days-count">{daysRemaining} days</div>
          <p className="data-availability">
            Your data will be available only till {dataAvailableUntil}
          </p>
        </div>

        <div className="links-section">
          <button className="profile-link" onClick={handleQiblaFinder}>
            <span className="link-icon">🧭</span> Qibla Finder
          </button>
          
          <button className="profile-link" onClick={handleReadQuran}>
            <span className="link-icon">📖</span> Read Quran online
          </button>
          <button className="profile-link" onClick={handleEnglishQuran}>
            <span className="link-icon">📒</span> Read Quran in modern english
          </button>
          
          <button className="profile-link" onClick={handleFeedback}>
            <span className="link-icon">❤️</span> Feedback / Feature request
          </button>
          
          {/* <button className="profile-link" onClick={handleIndiaDonation}>
            <span className="link-icon">🇮🇳</span> Donations - India
          </button>
          
          <button className="profile-link" onClick={handleUSADonation}>
            <span className="link-icon">🇺🇸</span> Donations - USA
          </button> */}

          {/* New Invite Friends button */}
          <button className="profile-link" onClick={handleInviteFriends}>
            <span className="link-icon">🤝</span> Invite Friends
          </button>
          
          <button className="profile-link signout" onClick={handleSignOut}>
            <span className="link-icon">🚪</span> Sign out
          </button>
        </div>
      </div>
      
      <footer className="profile-footer">
        <p>Thank you for using ramadan-tracker.web.app</p>
      </footer>

      {/* Dialog for India donation QR code */}
      <dialog id="india-donation-dialog" className="donation-dialog">
        <div className="dialog-content">
          <h3>Donate (India)</h3>
          <div className="qr-container">
            {/* Replace with actual QR code */}
            <div className="placeholder-qr">
              India Donation QR Code
            </div>
          </div>
          <p className="donation-info">Scan this QR code to donate within India</p>
          <button className="close-dialog" onClick={() => closeDialog('india-donation-dialog')}>
            Close
          </button>
        </div>
      </dialog>

      {/* Dialog for USA donation QR code */}
      <dialog id="usa-donation-dialog" className="donation-dialog">
        <div className="dialog-content">
          <h3>Donate (USA)</h3>
          <div className="qr-container">
        
            <div className="placeholder-qr">
            Zelle: +1-945-333-6322
            </div>
          </div>
          <p className="donation-info">Scan this QR code to donate within USA</p>
          <button className="close-dialog" onClick={() => closeDialog('usa-donation-dialog')}>
            Close
          </button>
        </div>
      </dialog>
      
      {/* Sign out confirmation dialog */}
      <dialog id="signout-dialog" className="confirmation-dialog">
        <div className="dialog-content">
          <h3>Sign Out</h3>
          <p>Are you sure you want to sign out?</p>
          <div className="dialog-buttons">
            <button className="cancel-button" onClick={() => closeDialog('signout-dialog')}>
              Cancel
            </button>
            <button className="confirm-button" onClick={confirmSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default ProfileScreen;