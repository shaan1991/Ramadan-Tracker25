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
  const [installPrompt, setInstallPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [installGuideClosing, setInstallGuideClosing] = useState(false);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [installGuidePop, setInstallGuidePop] = useState(false);
  const [installBrowserLabel, setInstallBrowserLabel] = useState('your browser');

  useEffect(() => {
    if (!userData) return;
    const defaultStart = RAMADAN_REGIONS[DEFAULT_RAMADAN_REGION] || formatDateString(DEFAULT_RAMADAN_START_DATE);
    setCustomStart(userData.ramadanStartDate || defaultStart);
    setCustomLength(userData.ramadanLength || 30);
  }, [userData]);

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    const userAgent = window.navigator.userAgent || '';
    const isIosDevice = /iphone|ipad|ipod/i.test(userAgent);
    setShowIosHint(isIosDevice && !isStandaloneMode);
    const isChrome = /Chrome|Chromium|CriOS/i.test(userAgent);
    const isEdge = /Edg/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !isChrome && !isEdge;
    const isFirefox = /Firefox/i.test(userAgent);
    if (isEdge) {
      setInstallBrowserLabel('Microsoft Edge');
    } else if (isChrome) {
      setInstallBrowserLabel('Chrome');
    } else if (isSafari) {
      setInstallBrowserLabel('Safari');
    } else if (isFirefox) {
      setInstallBrowserLabel('Firefox');
    } else {
      setInstallBrowserLabel('your browser');
    }

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setInstallPrompt(null);
      setIsStandalone(true);
      setShowIosHint(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Allow user to switch between Daily/Ramadan without forcing it.

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

  const handleInstallApp = () => {
    if (isStandalone) return;
    setShowInstallGuide(true);
  };

  useEffect(() => {
    if (!showInstallGuide) {
      setInstallGuideOpen(false);
      setInstallGuidePop(false);
      return;
    }
    const frame = requestAnimationFrame(() => {
      setInstallGuideOpen(true);
      setInstallGuidePop(true);
    });
    const resetTimer = setTimeout(() => setInstallGuidePop(false), 320);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resetTimer);
    };
  }, [showInstallGuide]);

  const handleCloseInstallGuide = () => {
    setInstallGuideClosing(true);
    setInstallGuideOpen(false);
    setInstallGuidePop(false);
    setTimeout(() => {
      setShowInstallGuide(false);
      setInstallGuideClosing(false);
    }, 220);
  };

  const handleConfirmInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    try {
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(null);
      setCanInstall(false);
      setInstallGuideClosing(true);
      setInstallGuideOpen(false);
      setInstallGuidePop(false);
      setTimeout(() => {
        setShowInstallGuide(false);
        setInstallGuideClosing(false);
      }, 220);
    }
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
            Track your worship every day. Ramadan gets special streaks and insights.
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
              {isRamadanMode && streakMode === 'ramadan' && (
                <div className="streak-card">
                  <div className="streak-icon">🕌</div>
                  <div className="streak-label">Taraweeh</div>
                  <div className="streak-value">{streaks.taraweeh.current} days</div>
                </div>
              )}
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

          <div className={`pwa-install-panel ${isStandalone ? 'installed' : ''}`}>
            <div className="pwa-install-header">
              <span className="pwa-install-icon">✦</span>
              <div>
                <h3>
                  Install the App
                  {isStandalone && <span className="pwa-install-badge">Installed</span>}
                </h3>
                <p>Get quick access and a smoother experience.</p>
              </div>
            </div>
            {!isStandalone && canInstall && (
              <button className="pwa-install-button" onClick={handleInstallApp}>
                Install on this device
              </button>
            )}
            {!isStandalone && showIosHint && !canInstall && (
              <button className="pwa-install-button outline" onClick={handleInstallApp}>
                View install steps
              </button>
            )}
            {!isStandalone && !canInstall && !showIosHint && (
              <p className="pwa-install-hint">
                Install isn’t ready yet. Visit a few times or open in Chrome/Edge.
              </p>
            )}
            {isStandalone && (
              <p className="pwa-install-hint">
                You are already using the installed app.
              </p>
            )}
          </div>
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

      {!isStandalone && showInstallGuide && (
        <div
          className={`install-guide-overlay ${installGuideOpen ? 'open' : ''} ${installGuideClosing ? 'closing' : ''}`}
          onClick={handleCloseInstallGuide}
        >
          <div
            className={`install-guide-card ${installGuideOpen ? 'open' : ''} ${installGuideClosing ? 'closing' : ''} ${installGuidePop ? 'pop' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="install-guide-header">
              <span className="install-guide-icon">⬇️</span>
              <div>
                <h3>Install the App</h3>
                <p>Get faster access and a more app‑like experience.</p>
              </div>
            </div>

            {showIosHint && !canInstall && (
              <div className="install-guide-steps">
                <div className="install-guide-step">
                  <span className="step-number">1</span>
                  <span>Tap the Share icon in {installBrowserLabel}.</span>
                </div>
                <div className="install-guide-step">
                  <span className="step-number">2</span>
                  <span>Choose “Add to Home Screen”.</span>
                </div>
                <div className="install-guide-step">
                  <span className="step-number">3</span>
                  <span>Confirm to add the app.</span>
                </div>
              </div>
            )}

            {canInstall && (
              <div className="install-guide-actions">
                <button className="install-guide-primary" onClick={handleConfirmInstall}>
                  Continue to Install
                </button>
                <button className="install-guide-secondary" onClick={handleCloseInstallGuide}>
                  Not now
                </button>
              </div>
            )}

            {!canInstall && !showIosHint && (
              <div className="install-guide-actions">
                <p className="install-guide-note">
                  Install becomes available after a few visits in supported browsers.
                </p>
                <button className="install-guide-secondary" onClick={handleCloseInstallGuide}>
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
