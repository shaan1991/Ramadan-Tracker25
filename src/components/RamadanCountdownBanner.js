import React, { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { getRamadanStartDate, isWithinRamadan } from '../utils/dateValidation';
import './RamadanCountdownBanner.css';

const RamadanCountdownBanner = () => {
  const { userData } = useUser();

  const bannerData = useMemo(() => {
    const now = new Date();
    const startDate = getRamadanStartDate(userData);
    if (isWithinRamadan(now, userData)) return null;
    if (now >= startDate) return null;

    const startMidnight = new Date(startDate);
    startMidnight.setHours(0, 0, 0, 0);
    const nowMidnight = new Date(now);
    nowMidnight.setHours(0, 0, 0, 0);
    const diffMs = startMidnight - nowMidnight;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      daysRemaining,
      startDateLabel: startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      region: userData?.ramadanRegion || 'Default region'
    };
  }, [userData]);

  if (!bannerData) return null;

  return (
    <div className="ramadan-countdown-banner">
      <div className="banner-left">
        <div className="banner-icon">🌙</div>
        <div className="banner-text">
          <p className="banner-title">Ramadan Countdown</p>
          <p className="banner-subtitle">
            {bannerData.daysRemaining} days to go · Expected start {bannerData.startDateLabel}
          </p>
          <p className="banner-footnote">
            Region: {bannerData.region} · Dates may shift by 1 day due to moon sighting
          </p>
        </div>
      </div>
      <div className="banner-right">
        <div className="banner-days">{bannerData.daysRemaining}</div>
        <div className="banner-label">days</div>
      </div>
    </div>
  );
};

export default RamadanCountdownBanner;
