// src/components/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { logOut } from '../services/authService';
import { getAllStreaks, calculatePrayerStreakFromData } from '../services/streakService';
import { DEFAULT_RAMADAN_START_DATE, DEFAULT_RAMADAN_REGION, RAMADAN_REGIONS } from '../utils/dateValidation';
import RegionSelector from './RegionSelector'; // Import the RegionSelector component
import './ProfileScreen.css';

const ProfileScreen = ({ onNavigate }) => {
  const { user, userData, isWithinRamadan, updateUserData } = useUser();
  const isRamadanMode = isWithinRamadan ? isWithinRamadan(new Date()) : false;
  const [streakMode, setStreakMode] = useState(isRamadanMode ? 'ramadan' : 'general');
  const [customStart, setCustomStart] = useState('');
  const [customLength, setCustomLength] = useState(30);
  const [streaks, setStreaks] = useState({
    quran: { current: 0, best: 0 },
    fasting: { current: 0, best: 0 },
    taraweeh: { current: 0, best: 0 },
    prayers: { current: 0, best: 0 }
  });
  const [ramadanSaveStatus, setRamadanSaveStatus] = useState('idle');
  const [ramadanSaveMessage, setRamadanSaveMessage] = useState('');

  useEffect(() => {
    if (!userData) return;
    const defaultStart = RAMADAN_REGIONS[DEFAULT_RAMADAN_REGION] || formatDateString(DEFAULT_RAMADAN_START_DATE);
    setCustomStart(userData.ramadanStartDate || defaultStart);
    setCustomLength(userData.ramadanLength || 30);
  }, [userData]);

  useEffect(() => {
    if (isRamadanMode) {
      setStreakMode('ramadan');
    }
  }, [isRamadanMode]);

  useEffect(() => {
    const loadStreaks = async () => {
      if (!user?.uid) return;
      const ramadanOnly = streakMode === 'ramadan';
      const data = await getAllStreaks(user.uid, { ramadanOnly, baseDate: new Date() });
      const prayerStreak = calculatePrayerStreakFromData(userData, { ramadanOnly, baseDate: new Date() });
      setStreaks({ ...data, prayers: prayerStreak });
    };
    loadStreaks();
  }, [user, userData, streakMode]);

  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSaveRamadanDates = async () => {
    if (!customStart) return;
    const length = Number(customLength) === 29 ? 29 : 30;
    try {
      setRamadanSaveStatus('saving');
      setRamadanSaveMessage('Saving…');
      const result = await updateUserData({
        ramadanStartDate: customStart,
        ramadanLength: length,
        ramadanLengthConfirmed: length === 29,
        ramadanStartDateOverride: true,
        ramadanRegion: 'Custom (Manual)'
      });
      if (result === false) {
        setRamadanSaveStatus('error');
        setRamadanSaveMessage('Could not save. Try again.');
        return;
      }
      setRamadanSaveStatus('success');
      setRamadanSaveMessage('Saved');
      setTimeout(() => {
        setRamadanSaveStatus('idle');
        setRamadanSaveMessage('');
      }, 1500);
    } catch (error) {
      console.error('Error saving Ramadan dates:', error);
      setRamadanSaveStatus('error');
      setRamadanSaveMessage('Could not save. Try again.');
    }
  };

  const handleResetRamadanDates = async () => {
    const defaultStart = RAMADAN_REGIONS[DEFAULT_RAMADAN_REGION] || formatDateString(DEFAULT_RAMADAN_START_DATE);
    await updateUserData({
      ramadanStartDate: defaultStart,
      ramadanLength: 30,
      ramadanLengthConfirmed: false,
      ramadanStartDateOverride: false,
      ramadanRegion: DEFAULT_RAMADAN_REGION
    });
    setCustomStart(defaultStart);
    setCustomLength(30);
  };

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
      if (onNavigate) {
        onNavigate('/');
      }
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
  };

  const handleInviteFriends = () => {
    const appUrl = 'https://ramadan-tracker.web.app';
    const message = `Check out this amazing Ramadan Tracker app! Track your prayers, fasts, and spiritual journey. Visit here: ${appUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Ramadan Tracker App',
        text: message,
        url: appUrl
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
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
          <h2>Year-Round Tracking</h2>
          <div className="days-count">{isRamadanMode ? 'Ramadan Mode' : 'Daily Mode'}</div>
          <p className="data-availability">
            Track your worship every day. Ramadan gets special streaks and focus.
          </p>
        </div>

        <div className="links-section">
          {/* Add the RegionSelector component at the top of the links section */}
          <RegionSelector />

          <div className="ramadan-settings-panel">
            <div className="ramadan-settings-header">
              <div className="ramadan-settings-title">
                <span className="ramadan-settings-icon">🌙</span>
                <div>
                  <h3>Ramadan Dates</h3>
                  <p>Manually update before Ramadan if needed</p>
                </div>
              </div>
            </div>
            <div className="ramadan-settings-grid">
              <label className="ramadan-settings-field">
                <span>Start date</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </label>
              <label className="ramadan-settings-field">
                <span>Length (days)</span>
                <select
                  value={customLength}
                  onChange={(e) => setCustomLength(Number(e.target.value))}
                >
                  <option value={29}>29</option>
                  <option value={30}>30</option>
                </select>
              </label>
            </div>
          <div className="ramadan-settings-actions">
            <button className="ramadan-btn outline" onClick={handleResetRamadanDates}>
              Reset to expected
            </button>
            <button className="ramadan-btn solid" onClick={handleSaveRamadanDates}>
              Save dates
            </button>
            {ramadanSaveStatus !== 'idle' && (
              <span className={`ramadan-save-status ${ramadanSaveStatus}`}>
                {ramadanSaveMessage}
              </span>
            )}
          </div>
          </div>

          <div className="streaks-panel">
            <div className="streaks-header">
              <h3>Streaks</h3>
              <div className="streaks-toggle">
                <button
                  className={`toggle-btn ${streakMode === 'general' ? 'active' : ''}`}
                  onClick={() => setStreakMode('general')}
                >
                  Daily
                </button>
                <button
                  className={`toggle-btn ${streakMode === 'ramadan' ? 'active' : ''}`}
                  onClick={() => setStreakMode('ramadan')}
                >
                  Ramadan
                </button>
              </div>
            </div>

            <div className="streaks-grid">
              <div className="streak-card">
                <div className="streak-icon">🙌</div>
                <div className="streak-label">Prayers</div>
                <div className="streak-value">{streaks.prayers.current} days</div>
              </div>
              <div className="streak-card">
                <div className="streak-icon">📖</div>
                <div className="streak-label">Qur'an</div>
                <div className="streak-value">{streaks.quran.current} days</div>
              </div>
              <div className="streak-card">
                <div className="streak-icon">🌙</div>
                <div className="streak-label">Fasting</div>
                <div className="streak-value">{streaks.fasting.current} days</div>
              </div>
              <div className="streak-card">
                <div className="streak-icon">🕌</div>
                <div className="streak-label">Taraweeh</div>
                <div className="streak-value">{streaks.taraweeh.current} days</div>
              </div>
            </div>
          </div>
          
          <button className="profile-link" onClick={handleQiblaFinder}>
            <span className="link-icon">🧭</span> Qibla Finder
          </button>
          
          <button className="profile-link" onClick={handleReadQuran}>
            <span className="link-icon">📖</span> Read Qur'an online
          </button>
          
          <button className="profile-link" onClick={handleEnglishQuran}>
            <span className="link-icon">📒</span> Read Qur'an in modern english
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
