import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './WeeklyReflection.css';

const getWeekStart = (date) => {
  const day = date.getDay(); // 0 = Sunday
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
};

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const WeeklyReflection = () => {
  const { userData, updateUserData } = useUser();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [closingHistory, setClosingHistory] = useState(false);

  const { weekKey, existing } = useMemo(() => {
    const now = new Date();
    const start = getWeekStart(now);
    const key = formatDateKey(start);
    const reflections = userData?.weeklyReflections || {};
    return {
      weekKey: key,
      existing: reflections[key] || null
    };
  }, [userData]);

  const [wentWell, setWentWell] = useState(existing?.wentWell || '');
  const [improve, setImprove] = useState(existing?.improve || '');

  useEffect(() => {
    setWentWell(existing?.wentWell || '');
    setImprove(existing?.improve || '');
    if (existing) setEditing(false);
  }, [existing]);

  const handleSave = async () => {
    if (!wentWell.trim() && !improve.trim()) return;
    setSaving(true);
    setStatus('Saving…');
    const nextReflections = {
      ...(userData?.weeklyReflections || {}),
      [weekKey]: {
        wentWell: wentWell.trim(),
        improve: improve.trim(),
        updatedAt: new Date().toISOString()
      }
    };
    const result = await updateUserData({ weeklyReflections: nextReflections });
    if (result === false) {
      setStatus('Could not save');
    } else {
      setStatus('Saved');
      setTimeout(() => setStatus(''), 1200);
    }
    setSaving(false);
  };

  const hasReflection = Boolean(existing?.wentWell || existing?.improve);
  const historyItems = useMemo(() => {
    const reflections = userData?.weeklyReflections || {};
    return Object.entries(reflections)
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([startKey, item]) => {
        const [y, m, d] = startKey.split('-').map(Number);
        const start = new Date(y, m - 1, d);
        const end = new Date(y, m - 1, d + 6);
        return {
          key: startKey,
          weekLabel: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          wentWell: item?.wentWell || '',
          improve: item?.improve || ''
        };
      });
  }, [userData]);

  return (
    <div className="weekly-reflection-card">
      <div className="weekly-reflection-header">
        <div>
          <h3>Weekly Reflection</h3>
          <p>Small note to end your week with intention.</p>
        </div>
        <div className="weekly-head-actions">
          <span className="weekly-pill">This week</span>
          <button className="weekly-history-btn" onClick={() => setShowHistory(true)}>
            History
          </button>
        </div>
      </div>

      {!editing && hasReflection && (
        <div className="weekly-read">
          <div>
            <div className="weekly-read-label">Went well</div>
            <div className="weekly-read-text">{existing?.wentWell || '—'}</div>
          </div>
          <div>
            <div className="weekly-read-label">To improve</div>
            <div className="weekly-read-text">{existing?.improve || '—'}</div>
          </div>
          <button className="weekly-edit" onClick={() => setEditing(true)}>
            Edit reflection
          </button>
        </div>
      )}

      {(editing || !hasReflection) && (
        <>
          <label className="weekly-field">
            <span>What went well?</span>
            <textarea
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              placeholder="A small win or moment you’re grateful for."
              rows={3}
            />
          </label>

          <label className="weekly-field">
            <span>One thing to improve?</span>
            <textarea
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              placeholder="A gentle intention for next week."
              rows={3}
            />
          </label>

          <div className="weekly-actions">
            <button className="weekly-save" onClick={handleSave} disabled={saving}>
              Save reflection
            </button>
            {status && <span className="weekly-status">{status}</span>}
          </div>
        </>
      )}

      {showHistory && (
        <div
          className={`weekly-history-overlay ${closingHistory ? 'closing' : ''}`}
          onClick={() => {
            setClosingHistory(true);
            setTimeout(() => {
              setShowHistory(false);
              setClosingHistory(false);
            }, 180);
          }}
        >
          <div
            className={`weekly-history-modal ${closingHistory ? 'closing' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="weekly-history-head">
              <h4>Weekly Reflection History</h4>
              <button
                className="weekly-history-close"
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
            {historyItems.length === 0 ? (
              <p className="weekly-history-empty">No reflections yet.</p>
            ) : (
              <div className="weekly-history-list">
                {historyItems.map((item) => (
                  <div key={item.key} className="weekly-history-item">
                    <div className="weekly-history-week">{item.weekLabel}</div>
                    <div className="weekly-history-line"><strong>Went well:</strong> {item.wentWell || '-'}</div>
                    <div className="weekly-history-line"><strong>Improve:</strong> {item.improve || '-'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReflection;
