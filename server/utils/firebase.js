import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Initialize Firebase with your config
const firebaseConfig = {
  apiKey: "AIzaSyDoVUX7Wp0C0Q8-YKd3szn-4pWa1U4waWE",
  authDomain: "todoapp-7faeb.firebaseapp.com", 
  projectId: "todoapp-7faeb",
  storageBucket: "todoapp-7faeb.appspot.com",
  messagingSenderId: "109221779685",
  appId: "1:109221779685:web:7d33be76abfbfdd48f5c0c",
  measurementId: "G-ZN9BXVB696"
};

// Initialize Firebase app and storage
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Upload file to Firebase Storage
 * @param {Object} file - The file object to upload
 * @param {String} path - The path in storage where the file should be saved
 * @returns {Promise<String>} - URL of the uploaded file
 */
export const uploadToStorage = async (file, path) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${path}/${uuidv4()}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, fileName);
    
    // Upload file - handle both file.data and tempFilePath scenarios
    let fileBuffer;
    
    if (file.tempFilePath) {
      // If using express-fileupload with tempFiles option
      fileBuffer = fs.readFileSync(file.tempFilePath);
    } else if (file.data) {
      // If using express-fileupload without tempFiles option
      fileBuffer = file.data;
    } else {
      throw new Error('No file data found');
    }
    
    await uploadBytes(storageRef, fileBuffer);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}; 