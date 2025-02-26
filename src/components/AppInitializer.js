// src/components/AppInitializer.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { runDataMigrations } from '../services/DataMigration';
import { migrateJuzData } from '../services/historyTracker';

// This component doesn't render anything visible
// It just runs initialization code when the app starts
const AppInitializer = () => {
  const { user } = useUser();
  const [migrationRun, setMigrationRun] = useState(false);

  useEffect(() => {
    // Run migrations and initialization when user is authenticated
    const initializeApp = async () => {
      if (!user || !user.uid || migrationRun) return;
      
      console.log('Running app initialization for user:', user.uid);
      
      try {
        // Run data migrations to ensure user data is in the latest format
        await runDataMigrations(user.uid);
        
        // Migrate Juz data specifically
        await migrateJuzData(user.uid);
        
        setMigrationRun(true);
        console.log('App initialization complete');
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };
    
    initializeApp();
  }, [user, migrationRun]);

  // This component doesn't render anything visible
  return null;
};

export default AppInitializer;