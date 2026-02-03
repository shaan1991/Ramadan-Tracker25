// File: src/services/duaService.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  setDoc,
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

  // Prefer subcollection first
  try {
    const duasRef = collection(db, 'users', userId, 'duas');
    const duasQuery = query(duasRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(duasQuery);

    if (!snapshot.empty) {
      return snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
    }
  } catch (error) {
    console.warn("Subcollection dua fetch failed, falling back:", error);
  }

  // Fall back to legacy array on the user document
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      return [];
    }
    const userData = userDoc.data();
    return (userData.duas || []).map((text, index) => ({
      id: `dua-${index}`,
      text,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  } catch (error) {
    console.error("Error getting duas:", error);
    return [];
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
    // Primary path: always add to subcollection
    const duasRef = collection(db, 'users', userId, 'duas');
    const newDua = {
      text,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(duasRef, newDua);

    // Mark migrated (best-effort)
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      duasMigrated: true,
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log("Dua added successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding dua to subcollection, falling back:", error);
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      const duas = userData.duas || [];
      duas.push(text);

      await setDoc(userDocRef, {
        ...userData,
        duas,
        duasMigrated: false,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return `dua-${duas.length - 1}`;
    } catch (fallbackError) {
      console.error("Error adding dua via fallback:", fallbackError);
      throw new Error(`Failed to add dua: ${fallbackError.message || error.message}`);
    }
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
    // Legacy array path
    if (duaId.startsWith('dua-')) {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
      const userData = userDoc.data();
      const index = parseInt(duaId.replace('dua-', ''), 10);
      if (isNaN(index) || index < 0 || !userData.duas || index >= userData.duas.length) {
        throw new Error("Invalid dua ID or dua not found");
      }
      userData.duas[index] = text;
      await updateDoc(userDocRef, {
        duas: userData.duas,
        updatedAt: serverTimestamp()
      });
      console.log("Dua updated successfully:", duaId);
      return true;
    }

    // Subcollection path
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
    // Legacy array path
    if (duaId.startsWith('dua-')) {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
      const userData = userDoc.data();
      const index = parseInt(duaId.replace('dua-', ''), 10);
      if (isNaN(index) || index < 0 || !userData.duas || index >= userData.duas.length) {
        throw new Error("Invalid dua ID or dua not found");
      }
      userData.duas.splice(index, 1);
      await updateDoc(userDocRef, {
        duas: userData.duas,
        updatedAt: serverTimestamp()
      });
      console.log("Dua deleted successfully:", duaId);
      return true;
    }

    // Subcollection path
    const duaRef = doc(db, 'users', userId, 'duas', duaId);
    await deleteDoc(duaRef);
    
    console.log("Dua deleted successfully:", duaId);
    return true;
  } catch (error) {
    console.error("Error deleting dua:", error);
    throw new Error(`Failed to delete dua: ${error.message}`);
  }
};
