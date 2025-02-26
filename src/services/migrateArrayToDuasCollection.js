// File: src/services/migrateArrayToDuasCollection.js
import { 
    doc, 
    getDoc, 
    updateDoc, 
    collection, 
    addDoc,
    serverTimestamp,
    writeBatch 
  } from 'firebase/firestore';
  import { db } from '../firebase';
  
  // This function migrates duas from user document array to a subcollection
  export const migrateDuasToSubcollection = async (userId) => {
    if (!userId) {
      console.error("No user ID provided for migration");
      return { success: false, error: "User ID is required" };
    }
  
    try {
      // Get the user document
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error("User document not found");
        return { success: false, error: "User document not found" };
      }
      
      const userData = userDoc.data();
      
      // Check if migration has already been completed
      if (userData.duasMigrated === true) {
        console.log("Duas already migrated for user:", userId);
        return { success: true, message: "Already migrated" };
      }
      
      // Check if the user has duas in the array format
      if (!userData.duas || !Array.isArray(userData.duas) || userData.duas.length === 0) {
        console.log("No duas to migrate for user:", userId);
        
        // Mark migration as complete even if there were no duas
        await updateDoc(userDocRef, {
          duasMigrated: true,
          duasMigrationDate: serverTimestamp()
        });
        
        return { success: true, message: "No duas to migrate" };
      }
      
      console.log(`Starting migration of ${userData.duas.length} duas for user: ${userId}`);
      
      // Create a batch for efficient writes
      const batch = writeBatch(db);
      const duasRef = collection(db, 'users', userId, 'duas');
      
      // Add each dua to the subcollection
      for (const duaText of userData.duas) {
        // Create a reference for the new dua document
        const newDuaRef = doc(duasRef);
        
        batch.set(newDuaRef, {
          text: duaText,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Mark the migration as complete in the user document
      batch.update(userDocRef, {
        duasMigrated: true,
        duasMigrationDate: serverTimestamp(),
        // We keep the duas array for backward compatibility
        // If you want to remove it later, you can run another migration
      });
      
      // Commit the batch
      await batch.commit();
      
      console.log(`Successfully migrated ${userData.duas.length} duas to subcollection for user: ${userId}`);
      return { 
        success: true, 
        count: userData.duas.length,
        message: `Successfully migrated ${userData.duas.length} duas to subcollection` 
      };
    } catch (error) {
      console.error("Error migrating duas:", error);
      return { success: false, error: error.message };
    }
  };