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
  try {
    const duasRef = collection(db, 'users', userId, 'duas');
    const duasQuery = query(duasRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(duasQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      text: doc.data().text,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting duas:", error);
    throw error;
  }
};

// Add a new dua
export const addDua = async (userId, text) => {
  try {
    const duasRef = collection(db, 'users', userId, 'duas');
    const newDua = {
      text,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(duasRef, newDua);
    return docRef.id;
  } catch (error) {
    console.error("Error adding dua:", error);
    throw error;
  }
};

// Update a dua
export const updateDua = async (userId, duaId, text) => {
  try {
    const duaRef = doc(db, 'users', userId, 'duas', duaId);
    await updateDoc(duaRef, {
      text,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating dua:", error);
    throw error;
  }
};

// Delete a dua
export const deleteDua = async (userId, duaId) => {
  try {
    const duaRef = doc(db, 'users', userId, 'duas', duaId);
    await deleteDoc(duaRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting dua:", error);
    throw error;
  }
};