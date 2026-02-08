import React, { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import './PrayerHeatmap.css';

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};


const PrayerHeatmap = ({ variant = 'card' }) => {
  const { userData } = useUser();

  const heatmap = useMemo(() => {
    const now = new Date();
    const totalDays = 84; // 12 weeks
    const days = [];
    for (let i = totalDays - 1; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = formatDateKey(date);
      const entry = userData?.history?.[key];
      let completed = 0;
      if (entry?.namaz) {
        completed = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha']
          .filter((p) => entry.namaz?.[p]).length;
      } else if (entry?.salah?.completed) {
        completed = entry.salah.completed;
      } else if (key === formatDateKey(now) && userData?.namaz) {
        completed = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha']
          .filter((p) => userData.namaz?.[p]).length;
      }
      days.push({
        key,
        date,
        completed
      });
    }
    return days;
  }, [userData]);

  const intensityClass = (count) => {
    if (count >= 5) return 'level-5';
    if (count >= 4) return 'level-4';
    if (count >= 3) return 'level-3';
    if (count >= 2) return 'level-2';
    if (count >= 1) return 'level-1';
    return 'level-0';
  };

  return (
    <div className={`prayer-heatmap-card ${variant === 'embedded' ? 'embedded' : ''}`}>
      <div className="prayer-heatmap-header">
        <h3>Prayer Heatmap</h3>
        <p>Last 12 weeks of consistency.</p>
      </div>
      <div className="heatmap-grid">
        {heatmap.map((day) => (
          <div
            key={day.key}
            className={`heatmap-cell ${intensityClass(day.completed)}`}
            title={`${day.key} · ${day.completed}/5`}
          />
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Low</span>
        <div className="legend-scale">
          <span className="heatmap-cell level-0" />
          <span className="heatmap-cell level-1" />
          <span className="heatmap-cell level-2" />
          <span className="heatmap-cell level-3" />
          <span className="heatmap-cell level-4" />
          <span className="heatmap-cell level-5" />
        </div>
        <span>High</span>
      </div>
    </div>
  );
};

export default PrayerHeatmap;
