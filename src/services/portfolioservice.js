// src/services/portfolioService.js
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase';

// Get all portfolios for a user
export const getUserPortfolios = async (userId) => {
  try {
    const q = query(collection(db, 'portfolios'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const portfolios = [];
    querySnapshot.forEach((doc) => {
      portfolios.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return portfolios;
  } catch (error) {
    console.error('Error getting user portfolios:', error);
    throw error;
  }
};

// Get a portfolio by ID
export const getPortfolioById = async (portfolioId) => {
  try {
    const docRef = doc(db, 'portfolios', portfolioId);
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
    } else {
      throw new Error('Portfolio not found');
    }
  } catch (error) {
    console.error('Error getting portfolio:', error);
    throw error;
  }
};

// Get a portfolio by username
export const getPortfolioByUsername = async (username) => {
  try {
    const q = query(collection(db, 'portfolios'), where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      return {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
    } else {
      throw new Error('Portfolio not found');
    }
  } catch (error) {
    console.error('Error getting portfolio by username:', error);
    throw error;
  }
};

// Create a new portfolio
export const createPortfolio = async (userId, portfolioData) => {
  try {
    const newPortfolio = {
      ...portfolioData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      experiences: [], // Add experiences array
    };
    
    const docRef = await addDoc(collection(db, 'portfolios'), newPortfolio);
    
    // Update the user's portfolios array
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const portfolios = userData.portfolios || [];
      
      await updateDoc(userRef, {
        portfolios: [...portfolios, docRef.id]
      });
    }
    
    return {
      id: docRef.id,
      ...newPortfolio
    };
  } catch (error) {
    console.error('Error creating portfolio:', error);
    throw error;
  }
};

// Update an existing portfolio
export const updatePortfolio = async (portfolioId, portfolioData) => {
  try {
    const portfolioRef = doc(db, 'portfolios', portfolioId);
    
    await updateDoc(portfolioRef, {
      ...portfolioData,
      updatedAt: serverTimestamp()
    });
    
    // Get the updated portfolio
    const updatedPortfolio = await getPortfolioById(portfolioId);
    return updatedPortfolio;
  } catch (error) {
    console.error('Error updating portfolio:', error);
    throw error;
  }
};

// Delete a portfolio
export const deletePortfolio = async (userId, portfolioId) => {
  try {
    // Delete the portfolio document
    await deleteDoc(doc(db, 'portfolios', portfolioId));
    
    // Update the user's portfolios array
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const portfolios = userData.portfolios || [];
      
      await updateDoc(userRef, {
        portfolios: portfolios.filter(id => id !== portfolioId)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    throw error;
  }
};

// Upload a project image
export const uploadProjectImage = async (userId, portfolioId, file) => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${portfolioId}/${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `portfolio-images/${fileName}`);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      url: downloadURL,
      path: `portfolio-images/${fileName}`
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete a project image
export const deleteProjectImage = async (imagePath) => {
  try {
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};