import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculatePrayerStreakFromData } from '../services/streakService';
import Celebration from './Celebration';
import './UnifiedPrayerTracker.css';
import './Celebration.css';

const moodSuggestions = [
  {
    type: 'Islamic',
    tier: 'low',
    weight: 2,
    title: 'Short dua and deep breath',
    description: 'Take 2 slow breaths and make a short dua asking for ease and clarity.'
  },
  {
    type: 'Islamic',
    tier: 'low',
    weight: 2,
    title: 'Two rakah reset',
    description: 'Pray two light rakah and sit for a minute of quiet dhikr.'
  },
  {
    type: 'Islamic',
    tier: 'low',
    weight: 2,
    title: 'Small dhikr routine',
    description: 'Say SubhanAllah, Alhamdulillah, Allahu Akbar (33x each) to recentre.'
  },
  {
    type: 'Islamic',
    tier: 'mid',
    weight: 2,
    title: 'Slow recitation',
    description: 'Recite a short surah slowly and reflect on a single ayah.'
  },
  {
    type: 'Islamic',
    tier: 'mid',
    weight: 1,
    title: 'Gratitude journal',
    description: 'Write 3 blessings you noticed today, even if they are small.'
  },
  {
    type: 'Islamic',
    tier: 'mid',
    weight: 1,
    title: 'Morning intention',
    description: 'Set a gentle niyyah for tomorrow and ask Allah for consistency.'
  },
  {
    type: 'Islamic',
    tier: 'low',
    weight: 2,
    title: 'Qur’an comfort',
    description: 'Read a few ayat you love and sit with the meaning for a moment.'
  },
  {
    type: 'Islamic',
    tier: 'mid',
    weight: 1,
    title: 'Soft dhikr walk',
    description: 'Take a short walk while saying dhikr quietly in your heart.'
  },
  {
    type: 'Islamic',
    tier: 'low',
    weight: 2,
    title: 'Ask for ease',
    description: 'Repeat “Allahumma la sahla illa ma ja’altahu sahla” a few times.'
  },
  {
    type: 'Islamic',
    tier: 'mid',
    weight: 1,
    title: 'Small sadaqah',
    description: 'Give a tiny amount or a kind act today as a lift for the heart.'
  },
  {
    type: 'Wellbeing',
    tier: 'low',
    weight: 2,
    title: 'Mini walk break',
    description: 'Take a 5-10 minute walk or step outside for fresh air and light.'
  },
  {
    type: 'Wellbeing',
    tier: 'low',
    weight: 2,
    title: 'Hydrate and reset',
    description: 'Drink a glass of water and stretch your shoulders and neck.'
  },
  {
    type: 'Wellbeing',
    tier: 'mid',
    weight: 1,
    title: 'Phone-free moment',
    description: 'Put your phone away for 10 minutes and sit quietly.'
  },
  {
    type: 'Wellbeing',
    tier: 'mid',
    weight: 1,
    title: 'Quick tidy',
    description: 'Tidy a small area around you to create calm and clarity.'
  },
  {
    type: 'Wellbeing',
    tier: 'low',
    weight: 2,
    title: 'Kind message',
    description: 'Send a short message to someone you care about.'
  },
  {
    type: 'Wellbeing',
    tier: 'low',
    weight: 2,
    title: 'Breathe in counts',
    description: 'Try 4-4-6 breathing: inhale 4, hold 4, exhale 6, repeat 4 times.'
  },
  {
    type: 'Wellbeing',
    tier: 'mid',
    weight: 1,
    title: 'Warm shower reset',
    description: 'Take a short warm shower and let your body relax.'
  },
  {
    type: 'Wellbeing',
    tier: 'mid',
    weight: 1,
    title: 'Sunlight moment',
    description: 'Stand by a window or outside for a minute of daylight.'
  },
  {
    type: 'Wellbeing',
    tier: 'low',
    weight: 2,
    title: 'Lower the load',
    description: 'Pick one small task to drop today and be gentle with yourself.'
  },
  {
    type: 'Wellbeing',
    tier: 'mid',
    weight: 1,
    title: 'Slow tea break',
    description: 'Make a warm drink and sip it slowly without multitasking.'
  }
];

const moodScale = [
  { value: 1, emoji: '😔', label: 'Very low' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' }
];

const moodAffirmations = [
  'Alhamdulillah, you are doing great today.',
  'MashaAllah, keep up the good momentum.',
  'Alhamdulillah — small steps add up.',
  'MashaAllah, your consistency is showing.',
  'Alhamdulillah, keep this calm energy going.',
  'MashaAllah, that is a beautiful state today.',
  'Alhamdulillah, may this ease continue.',
  'MashaAllah, your heart feels steady today.',
  'Alhamdulillah, today is a gift — keep it gentle.',
  'MashaAllah, you are showing up well.',
  'Alhamdulillah, may Allah bless this balance.',
  'MashaAllah, your effort is shining through.'
];

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYERS_LOWER = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'];

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
};

const UnifiedPrayerTracker = () => {
  const { user, userData, updateUserData, isWithinRamadan, recordDailyAction } = useUser();
  const [localNamaz, setLocalNamaz] = useState(null);
  const [localNamazOverrides, setLocalNamazOverrides] = useState({});
  const [moodRating, setMoodRating] = useState(0);
  const [averageMood, setAverageMood] = useState(0);
  const [localMoodOverrides, setLocalMoodOverrides] = useState({});
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompletedCountRef = useRef(0);
  const lastMoodTapRef = useRef({ value: null, ts: 0, dateKey: null });

  const getMoodDateKey = useCallback(() => {
    if (userData?.isHistoricalView && userData?.historicalDate) {
      return userData.historicalDate;
    }
    return formatDate(new Date());
  }, [userData?.isHistoricalView, userData?.historicalDate]);

  const getRecentMoodEntries = (history) => Object.entries(history || {})
    .sort((a, b) => parseDateKey(b[0]) - parseDateKey(a[0]))
    .slice(0, 30)
    .map(([, entry]) => {
      const value = entry?.mood;
      return typeof value === 'string' ? Number(value) : value;
    })
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);

  const computeAverageMood = (entries) => {
    if (!entries.length) return 0;
    const total = entries.reduce((sum, rating) => sum + rating, 0);
    return Math.round((total / entries.length) * 10) / 10;
  };

  const hashSeedToIndex = (seed, length) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
    }
    return length ? hash % length : 0;
  };

  const selectedSuggestion = useMemo(() => {
    if (!moodRating || moodRating > 3) return null;
    const seed = `${user?.uid || 'guest'}-${getMoodDateKey()}`;
    const pool = moodSuggestions.filter((suggestion) => {
      if (moodRating <= 3) return suggestion.tier === 'low' || suggestion.tier === 'mid';
      return suggestion.tier === 'mid';
    });
    const weighted = pool.flatMap((suggestion) =>
      Array.from({ length: Math.max(1, suggestion.weight || 1) }, () => suggestion)
    );
    const index = hashSeedToIndex(seed, weighted.length);
    return weighted[index];
  }, [moodRating, user?.uid, getMoodDateKey]);

  const selectedAffirmation = useMemo(() => {
    if (!moodRating || moodRating < 4) return null;
    const seed = `${user?.uid || 'guest'}-${getMoodDateKey()}-affirm`;
    const index = hashSeedToIndex(seed, moodAffirmations.length);
    return moodAffirmations[index];
  }, [moodRating, user?.uid, getMoodDateKey]);
  const showMoodMessage = Boolean(selectedSuggestion || selectedAffirmation);

  useEffect(() => {
    if (!userData?.namaz) return;
    const dateKey = getMoodDateKey();
    const historyEntry = userData.history?.[dateKey] || {};
    const overrideNamaz = localNamazOverrides[dateKey];
    const overrideMood = localMoodOverrides[dateKey];
    const isHistorical = userData?.isHistoricalView && userData?.historicalDate;
    const sourceNamaz = overrideNamaz
      || (isHistorical && historyEntry.namaz ? historyEntry.namaz : userData.namaz);
    const shouldSync = !localNamaz || PRAYERS_LOWER.some((key) => localNamaz[key] !== sourceNamaz[key]);
    if (shouldSync) {
      setLocalNamaz(sourceNamaz);
    }
    const todaysMood = historyEntry.mood ?? overrideMood ?? 0;
    const recentTap = lastMoodTapRef.current;
    const isRecentTap = recentTap.dateKey === dateKey && Date.now() - recentTap.ts < 650;
    if (!isRecentTap && todaysMood !== moodRating) {
      setMoodRating(todaysMood);
    }

    const historyWithOverride =
      !isHistorical && overrideMood !== undefined && historyEntry.mood === undefined
        ? {
            ...(userData.history || {}),
            [dateKey]: {
              ...(userData.history?.[dateKey] || {}),
              mood: overrideMood
            }
          }
        : userData.history;
    const entries = getRecentMoodEntries(historyWithOverride);
    const nextAverage = computeAverageMood(entries);
    if (nextAverage !== averageMood) {
      setAverageMood(nextAverage);
    }
    if (loading) {
      setLoading(false);
    }

    if (overrideMood !== undefined && historyEntry.mood === overrideMood) {
      setLocalMoodOverrides((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
    }

    if (overrideNamaz && historyEntry.namaz && PRAYERS_LOWER.every((key) => historyEntry.namaz?.[key] === overrideNamaz[key])) {
      setLocalNamazOverrides((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
    }
  }, [userData, userData?.isHistoricalView, userData?.historicalDate, moodRating, averageMood, loading, localNamaz, localMoodOverrides, localNamazOverrides, getMoodDateKey]);

  useEffect(() => {
    if (!userData) return;
    const isHistoricalView = userData?.isHistoricalView && userData?.historicalDate;
    const effectiveDate = isHistoricalView
      ? parseDateKey(userData.historicalDate)
      : new Date();
    const dateKey = formatDate(effectiveDate);
    const entry = userData.history?.[dateKey] || {};
    const hasHistoryForDate = Object.keys(entry).length > 0;
    const baseNamaz = hasHistoryForDate && entry.namaz ? entry.namaz : userData.namaz;
    const isComplete = baseNamaz
      ? ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].every(prayer => baseNamaz?.[prayer])
      : (entry.salah?.completed === 5 || userData.salah?.completed === 5);

    if (isHistoricalView) {
      const historyDates = Object.keys(userData.history || {});
      if (!historyDates.length) {
        setStreak(0);
        return;
      }
      const isConsecutiveDay = (currentDate, nextDate) => {
        const current = parseDateKey(currentDate);
        const next = parseDateKey(nextDate);
        const diffTime = current.getTime() - next.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
      };
      const sortedDates = historyDates
        .filter((d) => parseDateKey(d) <= parseDateKey(dateKey))
        .sort((a, b) => parseDateKey(b) - parseDateKey(a));
      let currentStreak = 0;
      for (let i = 0; i < sortedDates.length; i++) {
        const d = sortedDates[i];
        const entryForDate = userData.history?.[d] || {};
        const isDone = entryForDate.namaz
          ? ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].every(prayer => entryForDate.namaz?.[prayer])
          : (entryForDate.salah?.completed === 5);
        if (isDone) {
          if (currentStreak === 0) {
            currentStreak = 1;
          } else if (i > 0 && isConsecutiveDay(sortedDates[i - 1], d)) {
            currentStreak += 1;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    } else {
      const streakBaseDate = !isComplete
        ? new Date(effectiveDate.getFullYear(), effectiveDate.getMonth(), effectiveDate.getDate() - 1)
        : effectiveDate;
      const ramadanMode = isWithinRamadan ? isWithinRamadan(streakBaseDate) : false;
      const prayerStreak = calculatePrayerStreakFromData(userData, {
        ramadanOnly: ramadanMode,
        baseDate: streakBaseDate
      });
      setStreak(prayerStreak.current);
    }
  }, [userData, isWithinRamadan]);

  useEffect(() => {
    if (!userData) return;
    const isHistorical = userData?.isHistoricalView && userData?.historicalDate;
    if (isHistorical) return;
    const dateKey = getMoodDateKey();
    const alreadyCelebrated = userData.history?.[dateKey]?.prayerCelebrated === true;
    const completedCount = Object.values(userData.namaz).filter(Boolean).length;
    const prevCompleted = prevCompletedCountRef.current;
    if (completedCount === 5 && prevCompleted !== 5 && !alreadyCelebrated) {
      setShowCelebration(true);
      if (recordDailyAction) {
        recordDailyAction('prayerCelebrated', true);
      }
    }
    prevCompletedCountRef.current = completedCount;
  }, [userData, getMoodDateKey, recordDailyAction]);

  const handlePrayerToggle = async (prayerLower) => {
    if (!userData) return;
    const isHistoricalView = userData?.isHistoricalView && userData?.historicalDate;
    const currentNamaz = localNamaz
      || (isHistoricalView ? userData.history?.[getMoodDateKey()]?.namaz : null)
      || userData.namaz;
    const updatedNamaz = { ...currentNamaz, [prayerLower]: !currentNamaz[prayerLower] };
    const completedPrayers = Object.values(updatedNamaz).filter(Boolean).length;
    setLocalNamaz(updatedNamaz);
    setLocalNamazOverrides((prev) => ({ ...prev, [getMoodDateKey()]: updatedNamaz }));
    try {
      await updateUserData({
        namaz: updatedNamaz,
        salah: {
          completed: completedPrayers,
          total: 5
        }
      });
    } catch (error) {
      setLocalNamazOverrides((prev) => {
        const next = { ...prev };
        delete next[getMoodDateKey()];
        return next;
      });
      setLocalNamaz(currentNamaz);
    }
  };

  const handleMoodSelect = async (rating) => {
    if (!userData) return;
    setMoodRating(rating);
    setLocalMoodOverrides((prev) => ({
      ...prev,
      [getMoodDateKey()]: rating
    }));

    try {
      await updateUserData({ mood: rating });
      const dateKey = getMoodDateKey();
      const historyWithMood = {
        ...(userData.history || {}),
        [dateKey]: {
          ...(userData.history?.[dateKey] || {}),
          mood: rating
        }
      };
      const entries = getRecentMoodEntries(historyWithMood);
      setAverageMood(computeAverageMood(entries));
    } catch (error) {
      console.error('Error saving daily mood:', error);
    }
  };

  const handleMoodPointer = (rating) => {
    const now = Date.now();
    lastMoodTapRef.current = { value: rating, ts: now, dateKey: getMoodDateKey() };
    handleMoodSelect(rating);
  };

  const getMoodEmoji = (rating) => {
    const match = moodScale.find((option) => option.value === rating);
    return match ? match.emoji : '—';
  };

  const getMoodLabel = (rating) => {
    const match = moodScale.find((option) => option.value === rating);
    return match ? match.label : 'Not set';
  };

  if (loading || !userData) {
    return <div className="unified-prayer-loading">Loading prayers...</div>;
  }

  const isHistorical = userData?.isHistoricalView && userData?.historicalDate;
  const dateKey = getMoodDateKey();
  const historyNamaz = isHistorical ? userData.history?.[dateKey]?.namaz : null;
  const overrideNamaz = localNamazOverrides[dateKey];
  const effectiveNamaz = overrideNamaz || localNamaz || historyNamaz || userData.namaz;
  const completedCount = Object.values(effectiveNamaz).filter(Boolean).length;
  const moodBarPercent = Math.round((moodRating / 5) * 100);
  const effectiveDate = isHistorical ? parseDateKey(dateKey) : new Date();
  const isFriday = effectiveDate.getDay() === 5;

  return (
    <div className="unified-prayer-container">
      <div className="unified-prayer-header">
        <h3>🤲 Prayer Tracker</h3>
        <p className="unified-prayer-subtitle">Track completion and your daily check-in</p>
      </div>

      <div className="unified-prayer-stats">
        <div className="stat-card">
          <span className="stat-label">Prayers Today</span>
          <span className="stat-value">{completedCount}/5</span>
          <span className="stat-bar" style={{ width: `${(completedCount / 5) * 100}%` }}></span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Feel Today</span>
          <span className="stat-value">{getMoodEmoji(moodRating)} {getMoodLabel(moodRating)}</span>
          <span
            className="stat-bar"
            style={{ width: `${moodBarPercent}%`, '--bar-fill': '#444' }}
          ></span>
        </div>
        <div className="stat-card streak-card">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{streak} days</span>
          <span className="stat-icon">🔥</span>
        </div>
      </div>

      <div className="prayer-section">
        <div className="prayer-section-header">
          <h4>Daily check-in</h4>
          <span className="section-meta">Mood + guidance</span>
        </div>
        <div className={`mood-checkin ${showMoodMessage ? 'expanded' : ''}`}>
          <div className="mood-header">
            <h4>How did you feel today?</h4>
            <p>Quick daily check-in to notice your mood.</p>
          </div>
          <div className="mood-scale">
            {moodScale.map((option) => (
              <button
                key={option.value}
                className={`mood-btn ${moodRating === option.value ? 'active' : ''}`}
                onPointerDown={() => handleMoodPointer(option.value)}
                onClick={() => {
                  const lastTap = lastMoodTapRef.current;
                  if (lastTap.value === option.value && Date.now() - lastTap.ts < 450) return;
                  handleMoodSelect(option.value);
                }}
              >
                <span className="mood-emoji">{option.emoji}</span>
                <span className="mood-number">{option.value}</span>
              </button>
            ))}
          </div>
          <div className="mood-meta">
            <span className="mood-label">{getMoodLabel(moodRating)}</span>
            <span className="mood-average">30-day avg: {averageMood ? averageMood.toFixed(1) : '—'}</span>
          </div>

          <div className={`mood-suggestion-shell ${showMoodMessage ? 'visible' : 'hidden'}`}>
            {selectedSuggestion && (
              <div className="mood-suggestion">
                <div className="mood-suggestion-header">
                  <span className="mood-suggestion-title">Try this today</span>
                  <span className="mood-suggestion-tag">{selectedSuggestion.type}</span>
                </div>
                <div className="mood-suggestion-text">
                  <strong>{selectedSuggestion.title}</strong>
                  <p>{selectedSuggestion.description}</p>
                </div>
              </div>
            )}
            {selectedAffirmation && !selectedSuggestion && (
              <div className="mood-affirmation">
                {selectedAffirmation}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-divider" />

      <div className="prayer-section">
        <div className="prayer-section-header">
          <h4>Prayers</h4>
          <span className="section-meta">{completedCount}/5 completed</span>
        </div>
        <div className="unified-prayer-grid">
          {PRAYERS.map((prayer, idx) => {
            const prayerLower = PRAYERS_LOWER[idx];
            const isCompleted = effectiveNamaz[prayerLower] || false;
            const displayPrayer =
              prayer === 'Dhuhr' && isFriday ? "Jumuʿah" : prayer;

            return (
              <button
                key={prayer}
                type="button"
                className={`prayer-card ${isCompleted ? 'completed' : 'incomplete'}`}
                onClick={() => handlePrayerToggle(prayerLower)}
              >
                <div className="prayer-header">
                  <span className="prayer-symbol">{getPrayerSymbol(prayer)}</span>
                  <span className="prayer-text">{displayPrayer}</span>
                </div>

                <div
                  className={`prayer-toggle ${isCompleted ? 'checked' : ''}`}
                  title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {isCompleted ? '✓' : '○'}
                </div>

                <div className="prayer-footer">
                  {!isCompleted && (
                    <div className="prayer-placeholder">
                      Mark complete first
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showCelebration && (
        <Celebration onComplete={() => setShowCelebration(false)} />
      )}
    </div>
  );
};

const getPrayerSymbol = (prayer) => {
  const symbols = {
    Fajr: '🌅',
    Dhuhr: '☀️',
    Asr: '🌤️',
    Maghrib: '🌆',
    Isha: '🌙'
  };
  return symbols[prayer] || prayer;
};

export default UnifiedPrayerTracker;
