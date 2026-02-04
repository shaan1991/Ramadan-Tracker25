import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { isWithinRamadan, getRamadanStartDate, getRamadanEndDate } from '../utils/dateValidation';
import './CalendarNavigationHint.css';

const CalendarNavigationHint = ({ showCalendar }) => {
  const { userData } = useUser();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!userData || !showCalendar) {
      setShouldShow(false);
      return;
    }

    // Show hint during Ramadan to encourage focused tracking
    const isRamadan = isWithinRamadan(new Date(), userData);
    setShouldShow(isRamadan);
  }, [userData, showCalendar]);

  if (!shouldShow) {
    return null;
  }

  const startDate = getRamadanStartDate(userData);
  const endDate = getRamadanEndDate(userData);
  const formatMonthDay = (date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  return (
    <div className="calendar-hint-banner">
      <div className="hint-icon">📅</div>
      <div className="hint-content">
        <p className="hint-title">Ramadan Mode Active</p>
        <p className="hint-subtitle">
          Track daily progress from <strong>{formatMonthDay(startDate)}</strong> - <strong>{formatMonthDay(endDate)}, {endDate.getFullYear()}</strong>
        </p>
        <p className="hint-help">Your Ramadan streaks replace regular streaks during this month</p>
      </div>
    </div>
  );
};

export default CalendarNavigationHint;
