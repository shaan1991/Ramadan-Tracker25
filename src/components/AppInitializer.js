// src/components/AppInitializer.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { runDataMigrations } from '../services/DataMigration';
import { migrateJuzData } from '../services/historyTracker';
import { migrateDuasToSubcollection } from '../services/migrateArrayToDuasCollection';

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
        
        // Migrate duas from array to subcollection (auto-retry after cooldown if blocked)
        const blockedKey = 'duasMigrationBlockedUntil';
        const now = Date.now();
        const blockedUntil = typeof window !== 'undefined'
          ? Number(window.localStorage?.getItem(blockedKey) || 0)
          : 0;
        if (!blockedUntil || now >= blockedUntil) {
          const migrationResult = await migrateDuasToSubcollection(user.uid);
          if (migrationResult?.blocked && typeof window !== 'undefined') {
            const retryInMs = 6 * 60 * 60 * 1000; // 6 hours
            window.localStorage?.setItem(blockedKey, String(now + retryInMs));
          } else if (typeof window !== 'undefined') {
            window.localStorage?.removeItem(blockedKey);
          }
        }
        
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
