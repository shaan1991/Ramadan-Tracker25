import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import Celebration from './Celebration';
import './UnifiedPrayerTracker.css';
import '../styles/preRamadan.css';
import './Celebration.css';

const UnifiedPrayerTracker = () => {
  const { user, userData, updateUserData, recordDailyAction } = useUser();
  const [todayKhushu, setTodayKhushu] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [averageKhushu, setAverageKhushu] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const prayersLower = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];

  // Load khushu data on component mount
  useEffect(() => {
    const loadKhushuData = async () => {
      if (!user) return;
      try {
        // Load today's khushu ratings
        const today = new Date().toISOString().split('T')[0];
        const docRef = doc(db, 'users', user.uid, 'khushuProgress', today);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setTodayKhushu(snapshot.data());
        }

        // Calculate average khushu
        const khushuRef = collection(db, 'users', user.uid, 'khushuHistory');
        const q = query(khushuRef, orderBy('date', 'desc'), limit(30));
        const khushuSnapshots = await getDocs(q);
        
        let totalRatings = 0;
        let count = 0;
        let consecutiveDays = 0;
        let lastDate = null;

        khushuSnapshots.forEach((doc) => {
          const data = doc.data();
          const ratings = Object.values(data).filter(v => typeof v === 'number');
          ratings.forEach(rating => {
            totalRatings += rating;
            count++;
          });

          if (!lastDate) lastDate = new Date(data.date);
          const currentDate = new Date(data.date);
          const dayDiff = (lastDate - currentDate) / (1000 * 60 * 60 * 24);
          if (dayDiff <= 1) consecutiveDays++;
          lastDate = currentDate;
        });

        if (count > 0) {
          setAverageKhushu(Math.round((totalRatings / count) * 10) / 10);
        }
        setStreak(consecutiveDays);
      } catch (error) {
        console.error('Error loading Khushu data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKhushuData();
  }, [user]);

  // Detect when all 5 prayers are completed
  useEffect(() => {
    if (!userData) return;
    
    const completedCount = Object.values(userData.namaz).filter(Boolean).length;
    
    if (completedCount === 5 && prevCompletedCount !== 5) {
      setShowCelebration(true);
    }
    
    setPrevCompletedCount(completedCount);
  }, [userData, prevCompletedCount]);

  // Handle prayer completion toggle
  const handlePrayerToggle = async (prayerLower) => {
    if (!userData) return;

    const isBeforeRamadanDay = userData.beforeRamadan;
    if (isBeforeRamadanDay) {
      alert("You cannot record prayers for dates before Ramadan begins.");
      return;
    }
    
    const updatedNamaz = { ...userData.namaz, [prayerLower]: !userData.namaz[prayerLower] };
    const completedPrayers = Object.values(updatedNamaz).filter(Boolean).length;
    
    // Update UserContext (this saves to dailyLogs)
    await updateUserData({ 
      namaz: updatedNamaz,
      salah: { 
        completed: completedPrayers, 
        total: 5 
      }
    });
    
    // Record action in history
    await recordDailyAction(`prayer_${prayerLower}`, updatedNamaz[prayerLower]);
  };

  // Handle khushu rating
  const handleRatePrayer = async (prayer, rating) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const newKhushu = { ...todayKhushu, [prayer]: rating };
    setTodayKhushu(newKhushu);

    // Close modal immediately for better UX
    setShowRatingModal(false);
    setSelectedPrayer(null);

    try {
      // Save to today's tracking (khushuProgress)
      const docRef = doc(db, 'users', user.uid, 'khushuProgress', today);
      await setDoc(docRef, { ...newKhushu, date: today }, { merge: true });

      // Save to history (khushuHistory)
      const historyRef = doc(db, 'users', user.uid, 'khushuHistory', today);
      await setDoc(historyRef, { ...newKhushu, date: today }, { merge: true });
    } catch (error) {
      console.error('Error saving Khushu rating:', error);
    }
  };

  const getRatingColor = (rating) => {
    if (!rating) return '#e8e8e8';
    if (rating === 1) return '#d0d0d0';
    if (rating === 2) return '#b0b0b0';
    if (rating === 3) return '#808080';
    if (rating === 4) return '#505050';
    return '#333333';
  };

  const getRatingEmoji = (rating) => {
    if (!rating) return '—';
    if (rating === 1) return '😟';
    if (rating === 2) return '😕';
    if (rating === 3) return '😐';
    if (rating === 4) return '🙂';
    return '😊';
  };

  const getPrayerSymbol = (prayer) => {
    const symbols = {
      'Fajr': '🌅',
      'Dhuhr': '☀️',
      'Asr': '🌤️',
      'Maghrib': '🌆',
      'Isha': '🌙'
    };
    return symbols[prayer] || prayer;
  };

  const getRatingLabel = (rating) => {
    if (!rating) return 'Not rated';
    if (rating === 1) return 'Not focused';
    if (rating === 2) return 'Slightly focused';
    if (rating === 3) return 'Focused';
    if (rating === 4) return 'Very focused';
    return 'Deeply focused';
  };

  if (loading || !userData) {
    return <div className="unified-prayer-loading">Loading prayers...</div>;
  }

  const completedCount = Object.values(userData.namaz).filter(Boolean).length;

  return (
    <div className="unified-prayer-container">
      <div className="unified-prayer-header">
        <h3>🤲 Prayer Tracker</h3>
        <p className="unified-prayer-subtitle">Track completion & focus (Khushu)</p>
      </div>

      {/* Stats Cards */}
      <div className="unified-prayer-stats">
        <div className="stat-card">
          <span className="stat-label">Prayers Today</span>
          <span className="stat-value">{completedCount}/5</span>
          <span className="stat-bar" style={{ width: `${(completedCount / 5) * 100}%` }}></span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Focus</span>
          <span className="stat-value">{(averageKhushu / 2).toFixed(1)}/5</span>
          <span className="stat-bar" style={{ width: `${(averageKhushu / 10) * 100}%` }}></span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{streak} days</span>
          <span className="stat-icon">🔥</span>
        </div>
      </div>

      {/* Prayer Cards */}
      <div className="unified-prayer-grid">
        {prayers.map((prayer, idx) => {
          const prayerLower = prayersLower[idx];
          const isCompleted = userData.namaz[prayerLower] || false;
          const khushuRating = todayKhushu[prayer] || 0;
          const isUnrated = !khushuRating;

          return (
            <div key={prayer} className={`prayer-card ${isCompleted ? 'completed' : 'incomplete'}`}>
              <div className="prayer-header">
                <span className="prayer-symbol">{getPrayerSymbol(prayer)}</span>
                <span className="prayer-text">{prayer}</span>
              </div>

              {/* Prayer Completion Toggle */}
              <button 
                className={`prayer-toggle ${isCompleted ? 'checked' : ''}`}
                onClick={() => handlePrayerToggle(prayerLower)}
                title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {isCompleted ? '✓' : '○'}
              </button>

              {/* Khushu Rating (only show if prayer is completed) */}
              {isCompleted && (
                <div 
                  className={`khushu-rating ${isUnrated ? 'unrated' : ''}`}
                  onClick={() => {
                    setSelectedPrayer(prayer);
                    setShowRatingModal(true);
                  }}
                >
                  <div 
                    className="khushu-circle"
                    style={{ backgroundColor: getRatingColor(khushuRating), borderColor: getRatingColor(khushuRating) }}
                  >
                    <span className="khushu-emoji">{getRatingEmoji(khushuRating)}</span>
                  </div>
                  <span className="khushu-label">{getRatingLabel(khushuRating)}</span>
                </div>
              )}

              {/* Uncompleted placeholder */}
              {!isCompleted && (
                <div className="prayer-placeholder">
                  Mark complete first
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedPrayer && (
        <div className="rating-modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Rate {selectedPrayer} Focus</h4>
            <p>How focused were you during {selectedPrayer}?</p>

            <div className="rating-scale">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={`rating-btn ${todayKhushu[selectedPrayer] === num ? 'active' : ''}`}
                  style={{
                    backgroundColor: getRatingColor(num),
                    color: num >= 4 ? 'white' : '#333',
                    borderColor: getRatingColor(num)
                  }}
                  onClick={() => handleRatePrayer(selectedPrayer, num)}
                  title={getRatingLabel(num)}
                >
                  {getRatingEmoji(num)}
                </button>
              ))}
            </div>

            <div className="rating-descriptions">
              <div>😟 1: Not focused</div>
              <div>😕 2: Slightly focused</div>
              <div>😐 3: Focused</div>
              <div>🙂 4: Very focused</div>
              <div>😊 5: Deeply focused</div>
            </div>

            <button 
              className="modal-close-btn"
              onClick={() => setShowRatingModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Celebration */}
      {showCelebration && (
        <Celebration onComplete={() => setShowCelebration(false)} />
      )}
    </div>
  );
};

export default UnifiedPrayerTracker;
