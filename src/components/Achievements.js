import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculateStreak, calculatePrayerStreakFromData } from '../services/streakService';
import './Achievements.css';

const Achievements = () => {
  const { user, userData, isWithinRamadan } = useUser();
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  useEffect(() => {
    if (!userData || !user?.uid) return;

    const loadAchievements = async () => {
      const badges = [];
      const now = new Date();
      const ramadanMode = isWithinRamadan ? isWithinRamadan(now) : false;

      const prayerStreak = calculatePrayerStreakFromData(userData, { ramadanOnly: ramadanMode });
      const fastingStreak = await calculateStreak(user.uid, 'fasting', { ramadanOnly: ramadanMode });
      const quranStreak = await calculateStreak(user.uid, 'quran', { ramadanOnly: ramadanMode });

      // Prayer streaks (based on full 5 prayers completed in a day)
      if (prayerStreak.current >= 7) {
        badges.push({
          id: 'prayer-7',
          name: '🙌 7-Day Prayer Streak',
          description: '7 days of consistent prayers',
          icon: '🙌',
          unlocked: true
        });
      }
      if (prayerStreak.current >= 14) {
        badges.push({
          id: 'prayer-14',
          name: '🕌 14-Day Prayer Streak',
          description: 'Two weeks of consistent prayers',
          icon: '🕌',
          unlocked: true
        });
      }
      if (prayerStreak.current >= 30) {
        badges.push({
          id: 'prayer-30',
          name: '✨ 30-Day Prayer Streak',
          description: 'Prayed consistently for 30 days',
          icon: '✨',
          unlocked: true
        });
      }

      // Fasting streaks
      if (fastingStreak.current >= 10) {
        badges.push({
          id: 'fasting-10',
          name: '🌙 10-Day Faster',
          description: '10 days of fasting',
          icon: '🌙',
          unlocked: true
        });
      }
      if (fastingStreak.current >= 20) {
        badges.push({
          id: 'fasting-20',
          name: '⭐ 20-Day Faster',
          description: '20 days of fasting',
          icon: '⭐',
          unlocked: true
        });
      }

      // Qur'an milestones
      const totalJuzCompleted = Array.isArray(userData.completedJuzs) ? userData.completedJuzs.length : 0;
      if (totalJuzCompleted >= 10) {
        badges.push({
          id: 'quran-10',
          name: '📖 10 Juz Reader',
          description: 'Read 10 Juz of Qur\'an',
          icon: '📖',
          unlocked: true
        });
      }
      if (totalJuzCompleted >= 30) {
        badges.push({
          id: 'quran-30',
          name: '📚 Qur\'an Master',
          description: 'Completed reading entire Qur\'an',
          icon: '📚',
          unlocked: true
        });
      }

      // Qur'an streak milestones
      if (quranStreak.current >= 7) {
        badges.push({
          id: 'quran-streak-7',
          name: '📗 7-Day Qur\'an Streak',
          description: 'Read Qur\'an for 7 days straight',
          icon: '📗',
          unlocked: true
        });
      }

      setUnlockedBadges(badges);
    };

    loadAchievements();
  }, [user, userData, isWithinRamadan]);

  if (!userData || unlockedBadges.length === 0) {
    return (
      <div className="achievements-container">
        <h3>🏆 Achievements</h3>
        <p className="no-achievements">Keep going! Achievements will unlock as you progress through Ramadan.</p>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      <h3>🏆 Achievements</h3>
      <div className="badges-grid">
        {unlockedBadges.map(badge => (
          <div key={badge.id} className="badge-item unlocked">
            <div className="badge-icon">{badge.icon}</div>
            <div className="badge-info">
              <p className="badge-name">{badge.name}</p>
              <p className="badge-desc">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
