import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import './EnhancedJuzTracker.css';

// Qur'an structure: Juz and Surah mapping
const QUR_AN_STRUCTURE = [
  { juz: 1, surahs: [{ name: 'Al-Fatiha', verses: 7 }, { name: 'Al-Baqarah', verses: 286 }], startSurah: 1 },
  { juz: 2, surahs: [{ name: 'Al-Baqarah', verses: 286 }], startSurah: 1 },
  { juz: 3, surahs: [{ name: 'Al-Baqarah', verses: 286 }], startSurah: 1 },
  { juz: 4, surahs: [{ name: 'Al-Baqarah', verses: 286 }], startSurah: 1 },
  { juz: 5, surahs: [{ name: 'Al-Baqarah', verses: 286 }, { name: 'Ali-Imran', verses: 200 }], startSurah: 2 },
  { juz: 6, surahs: [{ name: 'Ali-Imran', verses: 200 }], startSurah: 3 },
  { juz: 7, surahs: [{ name: 'Ali-Imran', verses: 200 }], startSurah: 3 },
  { juz: 8, surahs: [{ name: 'Ali-Imran', verses: 200 }, { name: 'An-Nisa', verses: 176 }], startSurah: 3 },
  { juz: 9, surahs: [{ name: 'An-Nisa', verses: 176 }], startSurah: 4 },
  { juz: 10, surahs: [{ name: 'An-Nisa', verses: 176 }], startSurah: 4 },
  { juz: 11, surahs: [{ name: 'An-Nisa', verses: 176 }, { name: 'Al-Maidah', verses: 120 }], startSurah: 4 },
  { juz: 12, surahs: [{ name: 'Al-Maidah', verses: 120 }], startSurah: 5 },
  { juz: 13, surahs: [{ name: 'Al-Maidah', verses: 120 }, { name: 'Al-Anam', verses: 165 }], startSurah: 5 },
  { juz: 14, surahs: [{ name: 'Al-Anam', verses: 165 }], startSurah: 6 },
  { juz: 15, surahs: [{ name: 'Al-Anam', verses: 165 }, { name: 'Al-Araf', verses: 206 }], startSurah: 6 },
  { juz: 16, surahs: [{ name: 'Al-Araf', verses: 206 }], startSurah: 7 },
  { juz: 17, surahs: [{ name: 'Al-Araf', verses: 206 }], startSurah: 7 },
  { juz: 18, surahs: [{ name: 'Al-Araf', verses: 206 }, { name: 'Al-Anfal', verses: 75 }], startSurah: 7 },
  { juz: 19, surahs: [{ name: 'At-Tawba', verses: 129 }], startSurah: 9 },
  { juz: 20, surahs: [{ name: 'At-Tawba', verses: 129 }, { name: 'Hud', verses: 123 }], startSurah: 9 },
  { juz: 21, surahs: [{ name: 'Hud', verses: 123 }], startSurah: 11 },
  { juz: 22, surahs: [{ name: 'Hud', verses: 123 }, { name: 'Yusuf', verses: 111 }], startSurah: 11 },
  { juz: 23, surahs: [{ name: 'Al-Hajj', verses: 78 }], startSurah: 22 },
  { juz: 24, surahs: [{ name: 'An-Nur', verses: 64 }], startSurah: 24 },
  { juz: 25, surahs: [{ name: 'Al-Furqan', verses: 77 }, { name: 'Ash-Shuara', verses: 227 }], startSurah: 25 },
  { juz: 26, surahs: [{ name: 'Ash-Shuara', verses: 227 }, { name: 'An-Naml', verses: 93 }], startSurah: 26 },
  { juz: 27, surahs: [{ name: 'An-Naml', verses: 93 }, { name: 'Al-Ankabut', verses: 69 }], startSurah: 27 },
  { juz: 28, surahs: [{ name: 'Al-Ankabut', verses: 69 }, { name: 'Luqman', verses: 34 }], startSurah: 29 },
  { juz: 29, surahs: [{ name: 'As-Sajdah', verses: 30 }, { name: 'Al-Ahzab', verses: 73 }], startSurah: 32 },
  { juz: 30, surahs: [{ name: 'Ash-Shura', verses: 53 }], startSurah: 42 }
];

const EnhancedJuzTracker = () => {
  const { user } = useUser();
  const [completedJuzs, setCompletedJuzs] = useState({});
  const [selectedJuz, setSelectedJuz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJuzData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'quranProgress', 'juzTracking');
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setCompletedJuzs(snapshot.data());
        }
      } catch (error) {
        console.error('Error loading Juz data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadJuzData();
  }, [user]);

  const toggleJuzCompletion = async (juzNumber) => {
    if (!user) return;

    const newState = { ...completedJuzs };
    newState[`juz_${juzNumber}`] = !newState[`juz_${juzNumber}`];
    setCompletedJuzs(newState);

    try {
      const docRef = doc(db, 'users', user.uid, 'quranProgress', 'juzTracking');
      await setDoc(docRef, newState, { merge: true });
    } catch (error) {
      console.error('Error saving Juz progress:', error);
    }
  };

  const completedCount = Object.values(completedJuzs).filter(Boolean).length;
  const progressPercentage = (completedCount / 30) * 100;

  if (loading) {
    return <div className="enhanced-juz-loading">Loading Qur'an progress...</div>;
  }

  return (
    <div className="enhanced-juz-container">
      <div className="juz-header">
        <h3>📖 Qur'an Progress</h3>
        <p className="juz-stats">{completedCount}/30 Juzs Completed</p>
      </div>

      <div className="juz-progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      <div className="juz-grid">
        {QUR_AN_STRUCTURE.map((juzData) => {
          const isCompleted = completedJuzs[`juz_${juzData.juz}`];
          return (
            <div
              key={juzData.juz}
              className={`juz-item ${isCompleted ? 'completed' : ''}`}
              onClick={() => {
                toggleJuzCompletion(juzData.juz);
                setSelectedJuz(isCompleted ? null : juzData);
              }}
            >
              <div className="juz-number">
                <span>{juzData.juz}</span>
              </div>
              {isCompleted && <span className="juz-checkmark">✓</span>}
            </div>
          );
        })}
      </div>

      {selectedJuz && (
        <div className="juz-details">
          <h4>Juz {selectedJuz.juz} Details</h4>
          <div className="surah-list">
            {selectedJuz.surahs.map((surah, idx) => (
              <div key={idx} className="surah-item">
                <span className="surah-name">{surah.name}</span>
                <span className="surah-verses">{surah.verses} verses</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedJuzTracker;
