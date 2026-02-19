// src/components/RandomSunnahSuggestion.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import './RandomSunnahSuggestion.css';

// Expanded collection of Sunnah suggestions
const SUNNAH_SUGGESTIONS = [
    {
      title: "🤲 Pray an Extra Sunnah Prayer",
      description: "Praying voluntary prayers in addition to the obligatory ones increases your rewards. Try adding 2 rakats before Fajr, 4 before Zuhr and 2 after, 2 after Maghrib, and 2 after Isha."
    },
    {
      title: "💧 Perfect Your Wudu",
      description: "Take extra care with your wudu today, ensuring water reaches between fingers and toes, and make dua afterward."
    },
    {
      title: "🌙 Wake Up for Tahajjud",
      description: "Try to wake up before Fajr to pray even just 2 rakats of Tahajjud. This time is especially blessed for supplications."
    },
    {
      title: "📿 Increase Your Dhikr",
      description: "Recite Subhanallah, Alhamdulillah, and Allahu Akbar 33 times each after every prayer today."
    },
    {
      title: "🤝 Reconcile with Someone",
      description: "If you have a strained relationship, take the initiative today to reach out and make peace."
    },
    {
      title: "🥄 Eat with Your Right Hand",
      description: "Practice eating and drinking with your right hand, and remember Bismillah before and Alhamdulillah after."
    },
    {
      title: "👨‍👩‍👧‍👦 Visit a Relative",
      description: "Call or visit a relative you haven't spoken to in a while to maintain ties of kinship."
    },
    {
      title: "😊 Smile at Others",
      description: "Make a conscious effort to smile at people you interact with today."
    },
    {
      title: "🍽️ Share Your Food",
      description: "Invite someone to share a meal with you or give food to someone in need."
    },
    {
      title: "📖 Read Quran with Reflection",
      description: "Read a portion of the Quran with contemplation (tadabbur), focusing on meaning."
    },
    {
      title: "🧠 Seek Knowledge",
      description: "Learn something new about Islam today through reading or a short lecture."
    },
    {
      title: "🤲 Make Dua for Others",
      description: "Make sincere dua for your family, friends, and the ummah."
    },
    {
      title: "🌿 Visit the Sick",
      description: "Call, message, or visit someone who is ill and make dua for their recovery."
    },
    {
      title: "🥛 Break Your Fast with Dates",
      description: "If fasting, try to break your fast with dates or water as the Prophet (PBUH) did."
    },
    {
      title: "🧠 Memorize a New Dua",
      description: "Learn a new dua today, such as for entering/leaving the home or traveling."
    },
    {
      title: "🧵 Dress Well and Modestly",
      description: "Pay special attention to modesty and cleanliness in your clothing today."
    },
    {
      title: "🛌 Sleep on Your Right Side",
      description: "Try sleeping on your right side tonight as the Prophet (PBUH) recommended."
    },
    {
      title: "🙏 Pray in Congregation",
      description: "Make extra effort to pray at least one prayer in congregation today."
    },
    {
      title: "💰 Give Extra Charity",
      description: "Give a small amount in charity today, even if it is just a little."
    },
    {
      title: "🤫 Guard Your Tongue",
      description: "Avoid backbiting, lying, and useless talk today."
    },
    {
      title: "🧘 Practice Patience",
      description: "Respond with patience when faced with challenges today."
    },
    {
      title: "📱 Limit Digital Distractions",
      description: "Set aside your phone during worship and family time today."
    },
    {
      title: "🔄 Say Istighfar 100 Times",
      description: "Try to incorporate regular istighfar throughout your day, aiming for at least 100 times."
    },
    {
      title: "🕌 Perform I'tikaf (Short)",
      description: "Spend extra time in the mosque today in remembrance of Allah."
    },
    {
      title: "🌛 Seek Laylatul Qadr",
      description: "Increase worship on odd nights during the last ten days of Ramadan."
    },
    {
      title: "🤔 Reflect on Creation",
      description: "Spend time observing nature and reflect on the greatness of the Creator."
    },
    {
      title: "📿 Recite Ayatul Kursi",
      description: "Recite Ayatul Kursi after each prayer and before sleeping."
    },
    {
      title: "🫴 Feed a Fasting Person",
      description: "Invite someone for iftar or contribute to a community iftar today."
    },
    {
      title: "🥣 Delay Suhoor",
      description: "If fasting tomorrow, try to delay suhoor closer to Fajr."
    },
    {
      title: "🤚 Send Salawat on the Prophet",
      description: "Increase your salawat today and throughout the day."
    },
    {
      title: "⚖️ Be Just in Your Dealings",
      description: "Ensure all your transactions and interactions are honest and fair."
    },
    {
      title: "🌿 Visit a Graveyard",
      description: "If appropriate, visit a graveyard to remember the Hereafter and make dua."
    },
    {
      title: "📖 Recite Surah Al-Kahf",
      description: "Recite Surah Al-Kahf today, especially if it is Friday."
    },
    {
      title: "🤲 Increase Salawat",
      description: "Send blessings upon the Prophet (PBUH) throughout the day."
    },
    {
      title: "🧼 Keep Good Hygiene",
      description: "Be mindful of cleanliness, good scent, and neat appearance today."
    },
    {
      title: "📿 Morning & Evening Adhkar",
      description: "Recite your morning and evening adhkar for protection and barakah."
    },
    {
      title: "🧡 Check on Parents",
      description: "Call, visit, or help your parents today with kindness."
    },
    {
      title: "📚 Teach Someone a Dua",
      description: "Share a dua with someone you love and explain its meaning."
    },
    {
      title: "🕌 Arrive Early to the Masjid",
      description: "Arrive early for prayer to spend time in dhikr and reflection."
    },
    {
      title: "🤐 Avoid Backbiting",
      description: "Guard your tongue today and avoid gossip."
    },
    {
      title: "🧾 Make Tawbah",
      description: "Take a moment for sincere repentance and renewal of intention."
    },
    {
      title: "🫶 Give a Small Gift",
      description: "Give a small gift to increase love and goodwill."
    },
    {
      title: "🕋 Face the Qibla in Dua",
      description: "When making a longer dua, face the Qibla as the Prophet (PBUH) often did."
    },
    {
      title: "🍵 Share a Drink",
      description: "Offer water or a drink to someone today."
    },
    {
      title: "📞 Reach Out to Someone Lonely",
      description: "Check in on someone who might feel lonely or overlooked."
    },
    {
      title: "🧎 Pray Sunnah Rawatib",
      description: "Try to complete the daily Sunnah prayers around the obligatory ones."
    },
    {
      title: "🧭 Verify Qibla Direction",
      description: "Confirm your prayer direction and help someone else check theirs."
    },
    {
      title: "🌧️ Make Dua During Rain",
      description: "If it rains, make dua during this blessed time."
    },
    {
      title: "🧊 Give Water to Someone",
      description: "Providing water is a simple but deeply rewarded act of charity."
    },
    {
      title: "📖 Read with Tajweed",
      description: "Focus on proper recitation and Tajweed rules for even a short portion."
    },
    {
      title: "💡 Turn Off Distractions",
      description: "Create a quiet worship window by turning off notifications."
    },
    {
      title: "🧠 Reflect on a Verse",
      description: "Pick one verse you recite today and reflect on its meaning."
    },
    {
      title: "🤝 Help a Neighbor",
      description: "Offer small help to a neighbor or check on their well-being."
    },
    {
      title: "🧺 Serve at Home",
      description: "Help with chores at home to follow the Prophet's example."
    },
    {
      title: "🧂 Eat Moderately",
      description: "Eat with balance and gratitude, following prophetic guidance on moderation."
    },
    {
      title: "📿 Say Subhanallah 100x",
      description: "Try to complete 100 Subhanallah today for extra remembrance."
    },
    {
      title: "🌙 Pray Witr",
      description: "Complete Witr prayer before sleeping if you haven’t already."
    },
    {
      title: "🧾 Write a Gratitude List",
      description: "Write down three blessings and thank Allah for them."
    },
    {
      title: "📖 Memorize a Short Surah",
      description: "Memorize a short surah or a few ayat today."
    }
  ];

const hashSeed = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
};

const pickSunnahForSeed = (seed) => {
  const items = [...SUNNAH_SUGGESTIONS];
  let rnd = hashSeed(seed) || 1;
  const rand = () => {
    rnd ^= rnd << 13;
    rnd ^= rnd >>> 17;
    rnd ^= rnd << 5;
    return (rnd >>> 0) / 0xffffffff;
  };
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items[0] || null;
};

const formatLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RandomSunnahSuggestion = () => {
  const { user, userData, recordDailyAction } = useUser();
  const [currentSunnah, setCurrentSunnah] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [pending, setPending] = useState(false);
  const [localOverrides, setLocalOverrides] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [closingHistory, setClosingHistory] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState('');

  const getDateKey = useCallback(() => {
    if (userData?.isHistoricalView && userData?.historicalDate) {
      return userData.historicalDate;
    }
    return formatLocalDateKey(new Date());
  }, [userData?.isHistoricalView, userData?.historicalDate]);

  const seed = useMemo(() => {
    const dateKey = getDateKey();
    const userKey = user?.uid || 'anonymous';
    return `${userKey}-${dateKey}`;
  }, [user?.uid, getDateKey]);

  const shuffledSuggestions = useMemo(() => {
    const first = pickSunnahForSeed(seed);
    return first ? [first] : [];
  }, [seed]);

  useEffect(() => {
    if (shuffledSuggestions.length === 0) return;
    setCurrentSunnah(shuffledSuggestions[0]);
  }, [shuffledSuggestions]);

  const dateKey = useMemo(() => getDateKey(), [getDateKey]);

  useEffect(() => {
    if (!userData) return;
    const historyEntry = userData.history?.[dateKey];
    const override = localOverrides[dateKey];
    const nextCompleted = override !== undefined ? override : !!historyEntry?.sunnahCompleted;
    setCompleted(nextCompleted);

    if (override !== undefined && historyEntry?.sunnahCompleted === override) {
      setLocalOverrides((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
    }
  }, [dateKey, userData, localOverrides]);

  const toggleCompleted = async (e) => {
    e.stopPropagation();
    if (pending) return;
    const next = !completed;
    setCompleted(next);
    setPending(true);
    setLocalOverrides((prev) => ({ ...prev, [dateKey]: next }));
    const success = await recordDailyAction('sunnahCompleted', next);
    if (!success) {
      setCompleted(!next);
      setLocalOverrides((prev) => {
        const updated = { ...prev };
        delete updated[dateKey];
        return updated;
      });
    }
    setPending(false);
  };

  const sunnahHistoryByMonth = useMemo(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const historyDays = Object.entries(userData?.history || {})
      .filter(([, entry]) => !!entry?.sunnahCompleted)
      .map(([key]) => key);

    if (completed && !historyDays.includes(dateKey)) {
      historyDays.push(dateKey);
    }

    const dayItems = historyDays
      .sort((a, b) => (a < b ? 1 : -1))
      .map((key) => {
        const [y, m, d] = key.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const monthKey = `${y}-${String(m).padStart(2, '0')}`;
        const suggested = pickSunnahForSeed(`${user?.uid || 'anonymous'}-${key}`);
        return {
          dateKey: key,
          date,
          monthKey,
          title: suggested?.title || 'Suggested Sunnah'
        };
      });

    const monthKeys = Array.from(new Set(dayItems.map((item) => item.monthKey)));
    if (!monthKeys.includes(currentMonthKey)) {
      monthKeys.unshift(currentMonthKey);
    }

    const monthOptions = monthKeys
      .map((key) => {
        const [y, m] = key.split('-').map(Number);
        const dt = new Date(y, m - 1, 1);
        return {
          key,
          label: dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
      })
      .sort((a, b) => (a.key < b.key ? 1 : -1));

    return {
      currentMonthKey,
      monthOptions,
      dayItems
    };
  }, [userData, completed, dateKey, user?.uid]);

  useEffect(() => {
    if (!showHistory) return;
    const defaultMonth = sunnahHistoryByMonth.currentMonthKey;
    setSelectedMonthKey((prev) => prev || defaultMonth);
  }, [showHistory, sunnahHistoryByMonth.currentMonthKey]);

  const selectedMonth = selectedMonthKey || sunnahHistoryByMonth.currentMonthKey;
  const filteredHistoryDays = sunnahHistoryByMonth.dayItems.filter(
    (item) => item.monthKey === selectedMonth
  );

  if (!currentSunnah) return null;

  return (
    <div className="suggested-sunnah">
      <p className="sunnah-header">Suggested Sunnah of the day</p>
      <div
        className={`sunnah-container ${completed ? 'completed' : ''}`}
        onClick={toggleCompleted}
        role="button"
      >
        <div className="sunnah-header-row">
          <p className="sunnah-title">{currentSunnah.title}</p>
        </div>
        <div className="sunnah-description show">{currentSunnah.description}</div>
        <div className="sunnah-actions">
          <button
            className={`sunnah-complete ${completed ? 'done' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleCompleted(e);
            }}
          >
            {completed ? 'Completed' : 'Mark completed'}
          </button>
          <button
            className="sunnah-history-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowHistory(true);
            }}
          >
            View history
          </button>
        </div>
      </div>
      {showHistory && (
        <div
          className={`sunnah-history-overlay ${closingHistory ? 'closing' : ''}`}
          onClick={() => {
            setClosingHistory(true);
            setTimeout(() => {
              setShowHistory(false);
              setClosingHistory(false);
            }, 180);
          }}
        >
          <div
            className={`sunnah-history-modal ${closingHistory ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sunnah-history-head">
              <h4>Sunnah Completion History</h4>
              <button
                className="sunnah-history-close"
                onClick={() => {
                  setClosingHistory(true);
                  setTimeout(() => {
                    setShowHistory(false);
                    setClosingHistory(false);
                  }, 180);
                }}
              >
                x
              </button>
            </div>
            <div className="sunnah-history-filters">
              <label>
                Month
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonthKey(e.target.value)}
                >
                  {sunnahHistoryByMonth.monthOptions.map((month) => (
                    <option key={month.key} value={month.key}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="sunnah-history-sub">
              {
                (sunnahHistoryByMonth.monthOptions.find((m) => m.key === selectedMonth)?.label
                || 'Selected month')
              } · {filteredHistoryDays.length} days completed
            </p>
            {filteredHistoryDays.length === 0 ? (
              <p className="sunnah-history-empty">No completions this month yet.</p>
            ) : (
              <div className="sunnah-history-list">
                {filteredHistoryDays.map((item) => {
                  const label = item.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });
                  return (
                    <div key={item.dateKey} className="sunnah-history-item">
                      <div className="history-left">
                        <span>{label}</span>
                        <span className="history-title">{item.title}</span>
                      </div>
                      <span className="history-check">Completed</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomSunnahSuggestion;
