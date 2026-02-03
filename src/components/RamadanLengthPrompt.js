import React, { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';
import { isWithinRamadan, calculateRamadanDay } from '../utils/dateValidation';
import './RamadanLengthPrompt.css';

const RamadanLengthPrompt = () => {
  const { userData, updateUserData } = useUser();

  const promptData = useMemo(() => {
    if (!userData) return null;
    if (userData.ramadanLengthConfirmed) return null;

    const today = new Date();
    if (!isWithinRamadan(today, userData)) return null;

    const dayOfRamadan = calculateRamadanDay(today, userData);
    if (dayOfRamadan < 29) return null;

    return { dayOfRamadan };
  }, [userData]);

  const confirmEndToday = async () => {
    await updateUserData({
      ramadanLength: 29,
      ramadanLengthConfirmed: true
    });
  };

  const extendToThirty = async () => {
    await updateUserData({
      ramadanLength: 30,
      ramadanLengthConfirmed: true
    });
  };

  if (!promptData) return null;

  return (
    <div className="ramadan-length-prompt">
      <div className="prompt-text">
        <p className="prompt-title">Ramadan Length Check</p>
        <p className="prompt-subtitle">
          Today is Day {promptData.dayOfRamadan}. Did Ramadan end after today?
        </p>
      </div>
      <div className="prompt-actions">
        <button className="prompt-btn outline" onClick={extendToThirty}>
          No, extend to 30
        </button>
        <button className="prompt-btn solid" onClick={confirmEndToday}>
          Yes, ended at 29
        </button>
      </div>
    </div>
  );
};

export default RamadanLengthPrompt;
