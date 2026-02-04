import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculateStreak, calculatePrayerStreakFromData } from '../services/streakService';
import './Achievements.css';

const Achievements = () => {
  const { user, userData, isWithinRamadan } = useUser();
  const [ramadanBadges, setRamadanBadges] = useState([]);
  const [generalBadges, setGeneralBadges] = useState([]);
  const [ramadanAll, setRamadanAll] = useState([]);
  const [generalAll, setGeneralAll] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('ramadan');

  useEffect(() => {
    if (!userData || !user?.uid) return;

    const loadAchievements = async () => {
      const now = new Date();
      const ramadanMode = isWithinRamadan ? isWithinRamadan(now) : false;
      const ramadanLength = userData?.ramadanLength || 30;

      const prayerStreakGeneral = calculatePrayerStreakFromData(userData, { ramadanOnly: false, baseDate: now });
      const prayerStreakRamadan = calculatePrayerStreakFromData(userData, { ramadanOnly: true, baseDate: now });

      const fastingStreakGeneral = await calculateStreak(user.uid, 'fasting', { ramadanOnly: false, baseDate: now });
      const fastingStreakRamadan = await calculateStreak(user.uid, 'fasting', { ramadanOnly: true, baseDate: now });
      const taraweehStreakRamadan = await calculateStreak(user.uid, 'taraweeh', { ramadanOnly: true, baseDate: now });
      const quranStreakGeneral = await calculateStreak(user.uid, 'quran', { ramadanOnly: false, baseDate: now });
      const quranStreakRamadan = await calculateStreak(user.uid, 'quran', { ramadanOnly: true, baseDate: now });

      const historyEntries = Object.entries(userData.history || {});
      const isRamadanDate = (dateStr) => {
        if (!isWithinRamadan) return false;
        return isWithinRamadan(new Date(dateStr));
      };

      const prayerCompleteDays = historyEntries.filter(([date, entry]) => {
        const byPrayerFlags = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha']
          .every(prayer => entry?.[`prayer_${prayer}`] === true);
        if (byPrayerFlags) return true;
        if (entry?.namaz) {
          return ['fajr', 'zuhr', 'asr', 'maghrib', 'isha']
            .every(prayer => entry.namaz?.[prayer] === true);
        }
        return false;
      }).length;

      const quranDays = historyEntries.filter(([, entry]) => {
        if (!entry) return false;
        if (entry.juzReadToday !== undefined) return true;
        if (Array.isArray(entry.completedJuzs) && entry.completedJuzs.length > 0) return true;
        if (entry.quran?.completed > 0) return true;
        return false;
      }).length;

      const fastingDaysRamadan = historyEntries.filter(([date, entry]) => isRamadanDate(date) && entry?.fasting).length;
      const fastingDaysGeneral = historyEntries.filter(([date, entry]) => !isRamadanDate(date) && entry?.fasting).length;
      const taraweehDaysRamadan = historyEntries.filter(([date, entry]) => isRamadanDate(date) && (entry?.prayedTaraweeh ?? entry?.taraweeh)).length;

      const sunnahDaysGeneral = historyEntries.filter(([date, entry]) => !isRamadanDate(date) && entry?.sunnahCompleted).length;
      const sunnahDaysRamadan = historyEntries.filter(([date, entry]) => isRamadanDate(date) && entry?.sunnahCompleted).length;

      const totalActiveDays = historyEntries.filter(([, entry]) => {
        if (!entry) return false;
        return Object.keys(entry).some(key => key !== 'day');
      }).length;

      const totalJuzCompleted = Array.isArray(userData.completedJuzs) ? userData.completedJuzs.length : 0;

      const general = [];
      if (totalActiveDays >= 1) {
        general.push({
          id: 'general-first-step',
          name: '🌱 First Step',
          description: 'Logged your first day',
          icon: '🌱',
          unlocked: true
        });
      }
      if (prayerStreakGeneral.current >= 7) {
        general.push({
          id: 'general-prayer-7',
          name: '🙌 7-Day Prayer Streak',
          description: 'Consistent prayers for a week',
          icon: '🙌',
          unlocked: true
        });
      }
      if (prayerStreakGeneral.current >= 30) {
        general.push({
          id: 'general-prayer-30',
          name: '✨ 30-Day Prayer Streak',
          description: 'Prayed consistently for 30 days',
          icon: '✨',
          unlocked: true
        });
      }
      if (quranStreakGeneral.current >= 7) {
        general.push({
          id: 'general-quran-7',
          name: '📗 7-Day Qur\'an Streak',
          description: 'Read Qur\'an 7 days straight',
          icon: '📗',
          unlocked: true
        });
      }
      if (quranDays >= 10) {
        general.push({
          id: 'general-quran-10',
          name: '📖 10 Qur\'an Days',
          description: 'Read Qur\'an on 10 different days',
          icon: '📖',
          unlocked: true
        });
      }
      if (sunnahDaysGeneral >= 5) {
        general.push({
          id: 'general-sunnah-5',
          name: '🌿 Sunnah Routine',
          description: 'Completed 5 Sunnahs on different days',
          icon: '🌿',
          unlocked: true
        });
      }
      if (sunnahDaysGeneral >= 10) {
        general.push({
          id: 'general-sunnah-10',
          name: '✨ Sunnah Consistency',
          description: 'Completed 10 Sunnahs on different days',
          icon: '✨',
          unlocked: true
        });
      }
      if (sunnahDaysGeneral >= 20) {
        general.push({
          id: 'general-sunnah-20',
          name: '🌟 Sunnah Momentum',
          description: 'Completed 20 Sunnahs on different days',
          icon: '🌟',
          unlocked: true
        });
      }
      if (fastingDaysGeneral >= 3) {
        general.push({
          id: 'general-fasting-3',
          name: '🥗 Voluntary Fasts',
          description: 'Fasted 3 non‑Ramadan days',
          icon: '🥗',
          unlocked: true
        });
      }

      const ramadan = [];
      if (prayerStreakRamadan.current >= 7) {
        ramadan.push({
          id: 'ramadan-prayer-7',
          name: '🕌 7 Ramadan Prayers',
          description: 'Seven days of complete prayers',
          icon: '🕌',
          unlocked: true
        });
      }
      if (prayerStreakRamadan.current >= 14) {
        ramadan.push({
          id: 'ramadan-prayer-14',
          name: '🌙 14 Ramadan Prayers',
          description: 'Two weeks of complete prayers',
          icon: '🌙',
          unlocked: true
        });
      }
      if (prayerStreakRamadan.current >= ramadanLength) {
        ramadan.push({
          id: 'ramadan-prayer-full',
          name: '✨ Full Ramadan Prayers',
          description: `Complete prayers for all ${ramadanLength} days`,
          icon: '✨',
          unlocked: true
        });
      }
      if (fastingDaysRamadan >= 10) {
        ramadan.push({
          id: 'ramadan-fasting-10',
          name: '🌙 10-Day Faster',
          description: '10 days of fasting',
          icon: '🌙',
          unlocked: true
        });
      }
      if (fastingDaysRamadan >= 20) {
        ramadan.push({
          id: 'ramadan-fasting-20',
          name: '⭐ 20-Day Faster',
          description: '20 days of fasting',
          icon: '⭐',
          unlocked: true
        });
      }
      if (fastingDaysRamadan >= ramadanLength) {
        ramadan.push({
          id: 'ramadan-fasting-full',
          name: '🏁 Full Ramadan Fast',
          description: `Fasted all ${ramadanLength} days`,
          icon: '🏁',
          unlocked: true
        });
      }
      if (taraweehDaysRamadan >= 10) {
        ramadan.push({
          id: 'ramadan-taraweeh-10',
          name: '🕯️ 10 Taraweeh Nights',
          description: 'Prayed Taraweeh 10 nights',
          icon: '🕯️',
          unlocked: true
        });
      }
      if (taraweehDaysRamadan >= 20) {
        ramadan.push({
          id: 'ramadan-taraweeh-20',
          name: '🕌 20 Taraweeh Nights',
          description: 'Prayed Taraweeh 20 nights',
          icon: '🕌',
          unlocked: true
        });
      }
      if (taraweehDaysRamadan >= ramadanLength) {
        ramadan.push({
          id: 'ramadan-taraweeh-full',
          name: '🌙 Full Taraweeh',
          description: `Prayed Taraweeh all ${ramadanLength} nights`,
          icon: '🌙',
          unlocked: true
        });
      }
      if (quranStreakRamadan.current >= 7) {
        ramadan.push({
          id: 'ramadan-quran-streak-7',
          name: '📗 7-Day Qur\'an Streak',
          description: 'Read Qur\'an 7 days in Ramadan',
          icon: '📗',
          unlocked: true
        });
      }
      if (totalJuzCompleted >= 10) {
        ramadan.push({
          id: 'ramadan-quran-10',
          name: '📖 10 Juz Reader',
          description: 'Read 10 Juz in Ramadan',
          icon: '📖',
          unlocked: true
        });
      }
      if (totalJuzCompleted >= 30) {
        ramadan.push({
          id: 'ramadan-quran-30',
          name: '📚 Qur\'an Master',
          description: 'Completed the Qur\'an',
          icon: '📚',
          unlocked: true
        });
      }
      if (sunnahDaysRamadan >= 10) {
        ramadan.push({
          id: 'ramadan-sunnah-10',
          name: '🌿 Sunnah Routine',
          description: 'Completed Sunnah 10 days',
          icon: '🌿',
          unlocked: true
        });
      }
      if (sunnahDaysRamadan >= 15) {
        ramadan.push({
          id: 'ramadan-sunnah-15',
          name: '✨ Sunnah Steady',
          description: 'Completed Sunnah 15 days',
          icon: '✨',
          unlocked: true
        });
      }
      if (sunnahDaysRamadan >= ramadanLength) {
        ramadan.push({
          id: 'ramadan-sunnah-full',
          name: '🌙 Full Sunnah Ramadan',
          description: `Completed Sunnah all ${ramadanLength} days`,
          icon: '🌙',
          unlocked: true
        });
      }

      const generalDefinitions = [
        {
          id: 'general-first-step',
          name: '🌱 First Step',
          description: 'Logged your first day',
          icon: '🌱',
          unlocked: totalActiveDays >= 1
        },
        {
          id: 'general-prayer-7',
          name: '🙌 7-Day Prayer Streak',
          description: 'Consistent prayers for a week',
          icon: '🙌',
          unlocked: prayerStreakGeneral.current >= 7
        },
        {
          id: 'general-prayer-30',
          name: '✨ 30-Day Prayer Streak',
          description: 'Prayed consistently for 30 days',
          icon: '✨',
          unlocked: prayerStreakGeneral.current >= 30
        },
        {
          id: 'general-quran-7',
          name: '📗 7-Day Qur\'an Streak',
          description: 'Read Qur\'an 7 days straight',
          icon: '📗',
          unlocked: quranStreakGeneral.current >= 7
        },
        {
          id: 'general-quran-10',
          name: '📖 10 Qur\'an Days',
          description: 'Read Qur\'an on 10 different days',
          icon: '📖',
          unlocked: quranDays >= 10
        },
        {
          id: 'general-sunnah-5',
          name: '🌿 Sunnah Routine',
          description: 'Completed 5 Sunnahs on different days',
          icon: '🌿',
          unlocked: sunnahDaysGeneral >= 5
        },
        {
          id: 'general-sunnah-10',
          name: '✨ Sunnah Consistency',
          description: 'Completed 10 Sunnahs on different days',
          icon: '✨',
          unlocked: sunnahDaysGeneral >= 10
        },
        {
          id: 'general-sunnah-20',
          name: '🌟 Sunnah Momentum',
          description: 'Completed 20 Sunnahs on different days',
          icon: '🌟',
          unlocked: sunnahDaysGeneral >= 20
        },
        {
          id: 'general-fasting-3',
          name: '🥗 Voluntary Fasts',
          description: 'Fasted 3 non‑Ramadan days',
          icon: '🥗',
          unlocked: fastingDaysGeneral >= 3
        }
      ];

      const ramadanDefinitions = [
        {
          id: 'ramadan-prayer-7',
          name: '🕌 7 Ramadan Prayers',
          description: 'Seven days of complete prayers',
          icon: '🕌',
          unlocked: prayerStreakRamadan.current >= 7
        },
        {
          id: 'ramadan-prayer-14',
          name: '🌙 14 Ramadan Prayers',
          description: 'Two weeks of complete prayers',
          icon: '🌙',
          unlocked: prayerStreakRamadan.current >= 14
        },
        {
          id: 'ramadan-prayer-full',
          name: '✨ Full Ramadan Prayers',
          description: `Complete prayers for all ${ramadanLength} days`,
          icon: '✨',
          unlocked: prayerStreakRamadan.current >= ramadanLength
        },
        {
          id: 'ramadan-fasting-10',
          name: '🌙 10-Day Faster',
          description: '10 days of fasting',
          icon: '🌙',
          unlocked: fastingDaysRamadan >= 10
        },
        {
          id: 'ramadan-fasting-20',
          name: '⭐ 20-Day Faster',
          description: '20 days of fasting',
          icon: '⭐',
          unlocked: fastingDaysRamadan >= 20
        },
        {
          id: 'ramadan-fasting-full',
          name: '🏁 Full Ramadan Fast',
          description: `Fasted all ${ramadanLength} days`,
          icon: '🏁',
          unlocked: fastingDaysRamadan >= ramadanLength
        },
        {
          id: 'ramadan-taraweeh-10',
          name: '🕯️ 10 Taraweeh Nights',
          description: 'Prayed Taraweeh 10 nights',
          icon: '🕯️',
          unlocked: taraweehDaysRamadan >= 10
        },
        {
          id: 'ramadan-taraweeh-20',
          name: '🕌 20 Taraweeh Nights',
          description: 'Prayed Taraweeh 20 nights',
          icon: '🕌',
          unlocked: taraweehDaysRamadan >= 20
        },
        {
          id: 'ramadan-taraweeh-full',
          name: '🌙 Full Taraweeh',
          description: `Prayed Taraweeh all ${ramadanLength} nights`,
          icon: '🌙',
          unlocked: taraweehDaysRamadan >= ramadanLength
        },
        {
          id: 'ramadan-quran-streak-7',
          name: '📗 7-Day Qur\'an Streak',
          description: 'Read Qur\'an 7 days in Ramadan',
          icon: '📗',
          unlocked: quranStreakRamadan.current >= 7
        },
        {
          id: 'ramadan-quran-10',
          name: '📖 10 Juz Reader',
          description: 'Read 10 Juz in Ramadan',
          icon: '📖',
          unlocked: totalJuzCompleted >= 10
        },
        {
          id: 'ramadan-quran-30',
          name: '📚 Qur\'an Master',
          description: 'Completed the Qur\'an',
          icon: '📚',
          unlocked: totalJuzCompleted >= 30
        },
        {
          id: 'ramadan-sunnah-10',
          name: '🌿 Sunnah Routine',
          description: 'Completed Sunnah 10 days',
          icon: '🌿',
          unlocked: sunnahDaysRamadan >= 10
        },
        {
          id: 'ramadan-sunnah-15',
          name: '✨ Sunnah Steady',
          description: 'Completed Sunnah 15 days',
          icon: '✨',
          unlocked: sunnahDaysRamadan >= 15
        },
        {
          id: 'ramadan-sunnah-full',
          name: '🌙 Full Sunnah Ramadan',
          description: `Completed Sunnah all ${ramadanLength} days`,
          icon: '🌙',
          unlocked: sunnahDaysRamadan >= ramadanLength
        }
      ];

      setGeneralAll(generalDefinitions);
      setRamadanAll(ramadanDefinitions);
      setGeneralBadges(generalDefinitions.filter((badge) => badge.unlocked));
      setRamadanBadges(ramadanDefinitions.filter((badge) => badge.unlocked));
    };

    loadAchievements();
  }, [user, userData, isWithinRamadan]);

  if (!userData) {
    return null;
  }

  const hasBadges = ramadanBadges.length > 0 || generalBadges.length > 0;

  if (!hasBadges) {
    return (
      <div className="achievements-container">
        <h3>🏆 Achievements</h3>
        <p className="no-achievements">Keep going! Achievements will unlock as you progress.</p>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h3>🏆 Achievements</h3>
        <button className="achievements-viewall" onClick={() => setShowAll(true)}>
          View all
        </button>
      </div>

      <div className="achievements-section">
        <div className="achievements-section-title">Ramadan Highlights</div>
        {ramadanBadges.length === 0 ? (
          <p className="achievements-section-note">No Ramadan achievements yet.</p>
        ) : (
          <div className="badges-carousel">
            {ramadanBadges.map(badge => (
              <div key={badge.id} className="badge-item unlocked carousel-card">
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-info">
                  <p className="badge-name">{badge.name}</p>
                  <p className="badge-desc">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="achievements-section">
        <div className="achievements-section-title">Everyday Achievements</div>
        {generalBadges.length === 0 ? (
          <p className="achievements-section-note">No everyday achievements yet.</p>
        ) : (
          <div className="badges-carousel">
            {generalBadges.map(badge => (
              <div key={badge.id} className="badge-item unlocked carousel-card">
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-info">
                  <p className="badge-name">{badge.name}</p>
                  <p className="badge-desc">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAll && (
        <div
          className={`achievements-modal-overlay ${isClosing ? 'closing' : ''}`}
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setShowAll(false);
              setIsClosing(false);
            }, 180);
          }}
        >
          <div
            className={`achievements-modal ${isClosing ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="achievements-modal-header">
              <h4>All Achievements</h4>
              <button
                className="achievements-modal-close"
                onClick={() => {
                  setIsClosing(true);
                  setTimeout(() => {
                    setShowAll(false);
                    setIsClosing(false);
                  }, 180);
                }}
              >
                ✕
              </button>
            </div>
            <div className="achievements-modal-tabs">
              <button
                className={`achievements-tab ${activeTab === 'ramadan' ? 'active' : ''}`}
                onClick={() => setActiveTab('ramadan')}
              >
                Ramadan
              </button>
              <button
                className={`achievements-tab ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                Everyday
              </button>
            </div>
            <div className="achievements-modal-content">
              {activeTab === 'ramadan' ? (
                ramadanAll.length === 0 ? (
                  <p className="achievements-section-note">No Ramadan achievements yet.</p>
                ) : (
                  <div className="badges-grid">
                    {ramadanAll.map(badge => (
                      <div key={badge.id} className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                        <div className="badge-icon">{badge.icon}</div>
                        <div className="badge-info">
                          <p className="badge-name">{badge.name}</p>
                          <p className="badge-desc">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                generalAll.length === 0 ? (
                  <p className="achievements-section-note">No everyday achievements yet.</p>
                ) : (
                  <div className="badges-grid">
                    {generalAll.map(badge => (
                      <div key={badge.id} className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                        <div className="badge-icon">{badge.icon}</div>
                        <div className="badge-info">
                          <p className="badge-name">{badge.name}</p>
                          <p className="badge-desc">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
