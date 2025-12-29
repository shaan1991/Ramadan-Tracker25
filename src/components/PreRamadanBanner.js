import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { isBeforeRamadan, getRamadanStartDate, getRamadanEndDate } from '../utils/dateValidation';
import './PreRamadanBanner.css';

const PreRamadanBanner = () => {
  const { userData } = useUser();
  const [shouldShow, setShouldShow] = useState(false);
  const [ramadanInfo, setRamadanInfo] = useState(null);

  useEffect(() => {
    if (!userData) {
      console.log('PreRamadanBanner: userData not loaded yet');
      return;
    }

    console.log('PreRamadanBanner: userData loaded', userData);

    // Check if we're before Ramadan
    const isBefore = isBeforeRamadan(new Date(), userData);
    console.log('PreRamadanBanner: isBefore =', isBefore);
    
    if (isBefore) {
      setShouldShow(true);
      
      const startDate = getRamadanStartDate(userData);
      const endDate = getRamadanEndDate(userData);
      
      console.log('PreRamadanBanner: startDate =', startDate, 'endDate =', endDate);
      
      // Format dates for display
      const startFormatted = startDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const endFormatted = endDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      setRamadanInfo({
        startDate: startFormatted,
        endDate: endFormatted,
        region: userData.ramadanRegion || 'USA, Saudi Arabia & Others'
      });
    } else {
      setShouldShow(false);
      console.log('PreRamadanBanner: Not showing (Ramadan has started or userData issue)');
    }
  }, [userData]);

  if (!shouldShow || !ramadanInfo) {
    return null;
  }

  return (
    <div className="pre-ramadan-banner">
      <div className="banner-content">
        <div className="banner-icon">🌙</div>
        <div className="banner-text">
          <h3>Ramadan 2026 Coming Soon</h3>
          <p>
            This app will be active for Ramadan from <strong>{ramadanInfo.startDate}</strong> to <strong>{ramadanInfo.endDate}</strong>
          </p>
          <p className="region-info">Region: {ramadanInfo.region}</p>
          <p className="banner-description">
            You can explore the app features now and prepare for tracking your spiritual journey. 
            The calendar will guide you through all 30 days of Ramadan.
          </p>
        </div>
        <div className="banner-decoration">✨</div>
      </div>
    </div>
  );
};

export default PreRamadanBanner;
