// File: src/services/duaService.js
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const db = getFirestore();

// Get all duas for a user
export const getDuas = async (userId) => {
  if (!userId) {
    console.error("No user ID provided to getDuas");
    throw new Error("User ID is required");
  }

  try {
    const duasRef = collection(db, 'users', userId, 'duas');
    const duasQuery = query(duasRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(duasQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      text: doc.data().text,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
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
    const duasRef = collection(db, 'users', userId, 'duas');
    const newDua = {
      text,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(duasRef, newDua);
    console.log("Dua added successfully with ID:", docRef.id);
    return docRef.id;
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
    const duaRef = doc(db, 'users', userId, 'duas', duaId);
    await updateDoc(duaRef, {
      text,
      updatedAt: serverTimestamp()
    });
    
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
    const duaRef = doc(db, 'users', userId, 'duas', duaId);
    await deleteDoc(duaRef);
    
    console.log("Dua deleted successfully:", duaId);
    return true;
  } catch (error) {
    console.error("Error deleting dua:", error);
    throw new Error(`Failed to delete dua: ${error.message}`);
  }
};