import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './Achievements.css';

const Achievements = () => {
  const { userData } = useUser();
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  useEffect(() => {
    if (!userData) return;

    const badges = [];

    // Prayer streaks
    if (userData.currentStreak >= 7) {
      badges.push({
        id: 'prayer-7',
        name: '🙌 7-Day Prayer Streak',
        description: '7 days of consistent prayers',
        icon: '🙌',
        unlocked: true
      });
    }
    if (userData.currentStreak >= 14) {
      badges.push({
        id: 'prayer-14',
        name: '🕌 14-Day Prayer Streak',
        description: 'Half way through Ramadan prayers',
        icon: '🕌',
        unlocked: true
      });
    }
    if (userData.currentStreak >= 30) {
      badges.push({
        id: 'prayer-30',
        name: '✨ Perfect Prayer Month',
        description: 'Prayed all 30 days of Ramadan',
        icon: '✨',
        unlocked: true
      });
    }

    // Fasting streaks
    const fastingStreak = userData.fastingStreak || 0;
    if (fastingStreak >= 10) {
      badges.push({
        id: 'fasting-10',
        name: '🌙 10-Day Faster',
        description: '10 days of fasting',
        icon: '🌙',
        unlocked: true
      });
    }
    if (fastingStreak >= 20) {
      badges.push({
        id: 'fasting-20',
        name: '⭐ 20-Day Faster',
        description: '20 days of fasting',
        icon: '⭐',
        unlocked: true
      });
    }

    // Qur'an milestones
    if (userData.totalJuzCompleted >= 10) {
      badges.push({
        id: 'quran-10',
        name: '📖 10 Juz Reader',
        description: 'Read 10 Juz of Qur\'an',
        icon: '📖',
        unlocked: true
      });
    }
    if (userData.totalJuzCompleted >= 30) {
      badges.push({
        id: 'quran-30',
        name: '📚 Qur\'an Master',
        description: 'Completed reading entire Qur\'an',
        icon: '📚',
        unlocked: true
      });
    }

    // Social engagement
    if (userData.totalSharesCount >= 5) {
      badges.push({
        id: 'social-5',
        name: '📢 Social Butterfly',
        description: 'Shared progress 5 times',
        icon: '📢',
        unlocked: true
      });
    }

    setUnlockedBadges(badges);
  }, [userData]);

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
