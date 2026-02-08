import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './MonthlyGoals.css';

const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
};

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const MonthlyGoals = () => {
  const { userData, updateUserData } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [status, setStatus] = useState('');

  const { targets, progress } = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = monthEnd.getDate();

    const defaultGoals = {
      monthlyPrayerTarget: daysInMonth * 5,
      monthlyQuranDaysTarget: Math.min(20, daysInMonth)
    };
    const savedGoals = userData?.goals || {};
    const finalGoals = {
      monthlyPrayerTarget: savedGoals.monthlyPrayerTarget ?? defaultGoals.monthlyPrayerTarget,
      monthlyQuranDaysTarget: savedGoals.monthlyQuranDaysTarget ?? defaultGoals.monthlyQuranDaysTarget
    };

    const history = userData?.history || {};
    let prayerCompleted = 0;
    let quranDays = 0;

    Object.keys(history).forEach((dateKey) => {
      const dateObj = parseDateKey(dateKey);
      if (dateObj < monthStart || dateObj > monthEnd) return;
      const entry = history[dateKey] || {};
      if (entry.namaz) {
        prayerCompleted += ['fajr', 'zuhr', 'asr', 'maghrib', 'isha']
          .filter((p) => entry.namaz?.[p]).length;
      } else if (entry.salah?.completed) {
        prayerCompleted += entry.salah.completed;
      }
      const quranDone = entry.juzReadToday !== undefined
        || (Array.isArray(entry.completedJuzs) && entry.completedJuzs.length > 0)
        || (entry.quran?.completed > 0);
      if (quranDone) quranDays += 1;
    });

    const todayKey = formatDateKey(now);
    if (history[todayKey] === undefined) {
      if (userData?.namaz) {
        prayerCompleted += ['fajr', 'zuhr', 'asr', 'maghrib', 'isha']
          .filter((p) => userData.namaz?.[p]).length;
      } else if (userData?.salah?.completed) {
        prayerCompleted += userData.salah.completed;
      }
      const quranDoneToday = Array.isArray(userData?.completedJuzs)
        ? userData.completedJuzs.length > 0
        : userData?.quran?.completed > 0;
      if (quranDoneToday) quranDays += 1;
    }

    return {
      targets: finalGoals,
      progress: {
        prayerCompleted,
        quranDays
      }
    };
  }, [userData]);

  const [prayerTarget, setPrayerTarget] = useState(targets.monthlyPrayerTarget);
  const [quranTarget, setQuranTarget] = useState(targets.monthlyQuranDaysTarget);

  useEffect(() => {
    setPrayerTarget(targets.monthlyPrayerTarget);
    setQuranTarget(targets.monthlyQuranDaysTarget);
  }, [targets.monthlyPrayerTarget, targets.monthlyQuranDaysTarget]);

  const handleSave = async () => {
    setStatus('Saving…');
    const result = await updateUserData({
      goals: {
        monthlyPrayerTarget: prayerTarget,
        monthlyQuranDaysTarget: quranTarget
      }
    });
    if (result === false) {
      setStatus('Could not save');
      return;
    }
    setStatus('Saved');
    setTimeout(() => setStatus(''), 1200);
  };

  const prayerPercent = Math.min(100, Math.round((progress.prayerCompleted / targets.monthlyPrayerTarget) * 100));
  const quranPercent = Math.min(100, Math.round((progress.quranDays / targets.monthlyQuranDaysTarget) * 100));

  return (
    <div className="monthly-goals-card">
      <div className="monthly-goals-header">
        <div>
          <h3>Monthly Goals</h3>
          <p>Keep a simple target for consistency.</p>
        </div>
        <button className="monthly-goals-edit" onClick={() => setShowModal(true)}>
          Edit
        </button>
      </div>

      <div className="goal-row">
        <div>
          <div className="goal-label">Prayers completed</div>
          <div className="goal-value">{progress.prayerCompleted}/{targets.monthlyPrayerTarget}</div>
        </div>
        <div className="goal-percent">{prayerPercent}%</div>
      </div>
      <div className="goal-bar">
        <span style={{ width: `${prayerPercent}%` }} />
      </div>

      <div className="goal-row">
        <div>
          <div className="goal-label">Qur'an days</div>
          <div className="goal-value">{progress.quranDays}/{targets.monthlyQuranDaysTarget}</div>
        </div>
        <div className="goal-percent">{quranPercent}%</div>
      </div>
      <div className="goal-bar">
        <span style={{ width: `${quranPercent}%` }} />
      </div>

      {showModal && (
        <div
          className={`goal-modal-overlay ${closingModal ? 'closing' : ''}`}
          onClick={() => {
            setClosingModal(true);
            setTimeout(() => {
              setShowModal(false);
              setClosingModal(false);
            }, 200);
          }}
        >
          <div
            className={`goal-modal ${closingModal ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="goal-modal-header">
              <h4>Edit Monthly Goals</h4>
              <button
                className="goal-modal-close"
                onClick={() => {
                  setClosingModal(true);
                  setTimeout(() => {
                    setShowModal(false);
                    setClosingModal(false);
                  }, 200);
                }}
              >
                ✕
              </button>
            </div>
            <div className="goal-edit">
              <label>
                Monthly prayer target
                <input
                  type="number"
                  min={1}
                  value={prayerTarget}
                  onChange={(e) => setPrayerTarget(Number(e.target.value))}
                />
              </label>
              <label>
                Monthly Qur'an days target
                <input
                  type="number"
                  min={1}
                  value={quranTarget}
                  onChange={(e) => setQuranTarget(Number(e.target.value))}
                />
              </label>
              <div className="goal-modal-actions">
                <button className="goal-save" onClick={handleSave}>Save goals</button>
                {status && <span className="goal-status">{status}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyGoals;
