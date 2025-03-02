// src/components/RegionSelector.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './RegionSelector.css';

// Define region groups with their Ramadan start dates
export const RAMADAN_REGIONS = {
  'USA, Saudi Arabia & Others': '2025-03-01',
  'India, Pakistan, Bangladesh, Malaysia & Others': '2025-03-02'
};

const RegionSelector = () => {
  const { userData, updateUserData } = useUser();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Load the user's selected region when component mounts
  useEffect(() => {
    if (userData) {
      setSelectedRegion(userData.ramadanRegion || 'USA, Saudi Arabia & Others'); // Default
    }
  }, [userData]);

  const openDialog = () => {
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const handleRegionChange = async (region) => {
    // Only update if the region is different
    if (region !== selectedRegion) {
      setSelectedRegion(region);
      
      // Update user data with the new region
      await updateUserData({
        ramadanRegion: region,
        ramadanStartDate: RAMADAN_REGIONS[region]
      });
      
      // Close the dialog after selection
      closeDialog();
    }
  };

  // Get the display text for the currently selected region
  const getSelectedRegionText = () => {
    return selectedRegion || 'Select Region';
  };

  return (
    <>
      <button className="profile-link" onClick={openDialog}>
        <span className="link-icon">🌎</span> Ramadan Region: {getSelectedRegionText()}
      </button>
      
      {/* Region selection dialog */}
      <dialog id="region-dialog" className="region-dialog" open={showDialog}>
        <div className="dialog-content">
          <h3>Select Your Region</h3>
          <p className="region-info">
            Different regions may observe Ramadan on different days.
            Select your region to ensure accurate tracking.
          </p>
          
          <div className="region-options">
            {Object.keys(RAMADAN_REGIONS).map((region) => (
              <button 
                key={region}
                className={`region-option ${region === selectedRegion ? 'selected' : ''}`}
                onClick={() => handleRegionChange(region)}
              >
                {region}
                {region === selectedRegion && <span className="check-icon">✓</span>}
              </button>
            ))}
          </div>
          
          <button className="close-dialog" onClick={closeDialog}>
            Cancel
          </button>
        </div>
      </dialog>
    </>
  );
};

export default RegionSelector;