import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { isBeforeRamadan, getRamadanStartDate, getRamadanEndDate } from '../utils/dateValidation';
import './CalendarNavigationHint.css';

const CalendarNavigationHint = ({ showCalendar }) => {
  const { userData } = useUser();
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!userData || !showCalendar) {
      setShouldShow(false);
      return;
    }

    // Show hint if we're before Ramadan
    const isBefore = isBeforeRamadan(new Date(), userData);
    setShouldShow(isBefore);
  }, [userData, showCalendar]);

  if (!shouldShow) {
    return null;
  }

  const startDate = getRamadanStartDate(userData);
  const endDate = getRamadanEndDate(userData);

  return (
    <div className="calendar-hint-banner">
      <div className="hint-icon">📅</div>
      <div className="hint-content">
        <p className="hint-title">Navigate to Ramadan Dates</p>
        <p className="hint-subtitle">
          Use the arrows to navigate to <strong>February {startDate.getDate()}</strong> - <strong>March {endDate.getDate()}, {endDate.getFullYear()}</strong>
        </p>
        <p className="hint-help">You can plan ahead and edit your progress for upcoming Ramadan days</p>
      </div>
    </div>
  );
};

export default CalendarNavigationHint;
