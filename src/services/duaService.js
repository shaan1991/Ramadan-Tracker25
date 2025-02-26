// File: src/services/duaService.js
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Get all duas for a user
export const getDuas = async (userId) => {
  if (!userId) {
    console.error("No user ID provided to getDuas");
    throw new Error("User ID is required");
  }

  try {
    // Check if user has the migration flag
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    const userData = userDoc.data();
    
    // If the migration has been completed, use the subcollection
    if (userData.duasMigrated === true) {
      const duasRef = collection(db, 'users', userId, 'duas');
      const duasQuery = query(duasRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(duasQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
    } 
    // Fall back to the array approach if migration hasn't happened yet
    // This ensures the app works during the transition period
    else {
      // Convert the duas array to the format expected by the Dua component
      return (userData.duas || []).map((text, index) => ({
        id: `dua-${index}`, // Generate an ID for each dua
        text,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }
  } catch (error) {
    console.error("Error getting duas:", error);
    throw new Error(`Failed to fetch duas: ${error.message}`);
  }
};

// Add a new dua
export const addDua = async (userId, text) => {
  if (!userId) {
    console.error("No user ID provided to addDua");
    throw new Error("User ID is required");
  }

  if (!text || text.trim().length === 0) {
    console.error("Empty dua text provided");
    throw new Error("Dua text cannot be empty");
  }

  // Enforce 250 character limit
  if (text.length > 250) {
    text = text.substring(0, 250);
  }

  try {
    // Check which storage method to use
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    const userData = userDoc.data();
    
    // If migration has been completed, use the subcollection
    if (userData.duasMigrated === true) {
      const duasRef = collection(db, 'users', userId, 'duas');
      const newDua = {
        text,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(duasRef, newDua);
      console.log("Dua added successfully with ID:", docRef.id);
      return docRef.id;
    } 
    // Otherwise use the array method
    else {
      // Get current duas array
      const duas = userData.duas || [];
      duas.push(text);
      
      // Update the document
      await updateDoc(userDocRef, {
        duas,
        updatedAt: serverTimestamp()
      });
      
      // Return a generated ID
      return `dua-${duas.length - 1}`;
    }
  } catch (error) {
    console.error("Error adding dua:", error);
    throw new Error(`Failed to add dua: ${error.message}`);
  }
};

// Update a dua
export const updateDua = async (userId, duaId, text) => {
  if (!userId || !duaId) {
    console.error("Missing user ID or dua ID in updateDua");
    throw new Error("User ID and dua ID are required");
  }

  if (!text || text.trim().length === 0) {
    console.error("Empty dua text provided for update");
    throw new Error("Dua text cannot be empty");
  }

  // Enforce 250 character limit
  if (text.length > 250) {
    text = text.substring(0, 250);
  }

  try {
    // Check which storage method to use
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    const userData = userDoc.data();
    
    // If migration has been completed, use the subcollection
    if (userData.duasMigrated === true) {
      // If the ID is in the old format (dua-X), this might be a race condition 
      // where the UI still has old IDs but the backend has migrated
      if (duaId.startsWith('dua-')) {
        console.warn("Received legacy dua ID format after migration. This is expected during transition.");
        
        // We can't do much here except warn the user
        throw new Error("This dua can't be updated because it's in the old format. Please refresh the page.");
      }
      
      const duaRef = doc(db, 'users', userId, 'duas', duaId);
      await updateDoc(duaRef, {
        text,
        updatedAt: serverTimestamp()
      });
    } 
    // Otherwise use the array method
    else {
      // Extract index from ID (format is dua-X)
      const index = parseInt(duaId.replace('dua-', ''), 10);
      
      if (isNaN(index) || index < 0 || !userData.duas || index >= userData.duas.length) {
        throw new Error("Invalid dua ID or dua not found");
      }
      
      // Update the specific dua in the array
      userData.duas[index] = text;
      
      // Update the document
      await updateDoc(userDocRef, {
        duas: userData.duas,
        updatedAt: serverTimestamp()
      });
    }
    
    console.log("Dua updated successfully:", duaId);
    return true;
  } catch (error) {
    console.error("Error updating dua:", error);
    throw new Error(`Failed to update dua: ${error.message}`);
  }
};

// Delete a dua
export const deleteDua = async (userId, duaId) => {
  if (!userId || !duaId) {
    console.error("Missing user ID or dua ID in deleteDua");
    throw new Error("User ID and dua ID are required");
  }

  try {
    // Check which storage method to use
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    
    const userData = userDoc.data();
    
    // If migration has been completed, use the subcollection
    if (userData.duasMigrated === true) {
      // If the ID is in the old format (dua-X), this might be a race condition
      if (duaId.startsWith('dua-')) {
        console.warn("Received legacy dua ID format after migration. This is expected during transition.");
        
        // We can't do much here except warn the user
        throw new Error("This dua can't be deleted because it's in the old format. Please refresh the page.");
      }
      
      const duaRef = doc(db, 'users', userId, 'duas', duaId);
      await deleteDoc(duaRef);
    } 
    // Otherwise use the array method
    else {
      // Extract index from ID (format is dua-X)
      const index = parseInt(duaId.replace('dua-', ''), 10);
      
      if (isNaN(index) || index < 0 || !userData.duas || index >= userData.duas.length) {
        throw new Error("Invalid dua ID or dua not found");
      }
      
      // Remove the dua from the array
      userData.duas.splice(index, 1);
      
      // Update the document
      await updateDoc(userDocRef, {
        duas: userData.duas,
        updatedAt: serverTimestamp()
      });
    }
    
    console.log("Dua deleted successfully:", duaId);
    return true;
  } catch (error) {
    console.error("Error deleting dua:", error);
    throw new Error(`Failed to delete dua: ${error.message}`);
  }
};