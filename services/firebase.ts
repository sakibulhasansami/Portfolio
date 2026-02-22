import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // <-- ১. Authentication Import kora holo
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  limit, 
  DocumentData,
  doc,
  setDoc,
  getDoc,
  deleteDoc,  // 🔴 NEW: For deleting comments
  updateDoc,  // 🔴 NEW: For updating comment status (approve/pin)
  where,      // 🔴 NEW: For filtering comments by itemId
  orderBy     // 🔴 NEW: For sorting comments by time
} from 'firebase/firestore';
import { Photo, Writing, Settings, Project, Comment } from '../types'; // 🔴 NEW: Added Comment import

const firebaseConfig = {
  apiKey: "AIzaSyDwwnW4xfWaNaA4fJBEdogKgSu_4BAHMPA",
  authDomain: "my-webpage-999.firebaseapp.com",
  projectId: "my-webpage-999",
  storageBucket: "my-webpage-999.firebasestorage.app",
  messagingSenderId: "471588118325",
  appId: "1:471588118325:web:89e9045b0f1005a5c8b67c",
  measurementId: "G-FC3KDVMX6H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // <-- ২. Auth Initialize ebong Export kora holo
const db = getFirestore(app);

// Helper to map doc to data with ID
const mapDoc = <T>(doc: DocumentData): T => ({ id: doc.id, ...doc.data() } as T);

export const fetchSettings = async (): Promise<Settings | null> => {
  try {
    const docRef = doc(db, 'settings', 'config');
    const docSnap = await getDoc(docRef);

    const defaultSettings: Settings = {
      bio: '',
      longBio: '',
      education: '',
      location: '',
      email: '',
      whatsappNumber: '', // 🔴 NEW: WhatsApp Number default
      heroImageUrl: 'https://picsum.photos/400/400?grayscale',
      heroAnimation: 'anim-static',
      heroBorderColor: '',
      heroAnimColor: '',
      heroAnimColor2: '',
      contentScale: 1,
      language: 'bn',
      theme: 'Liquid OS', // Default theme
      socialLinks: [] // Default empty
    };

    if (docSnap.exists()) {
      const data = docSnap.data();
      return { ...defaultSettings, ...data } as Settings;
    }

    // Fallback legacy method
    const querySnapshot = await getDocs(collection(db, 'settings'));
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[querySnapshot.docs.length - 1].data();
      return { ...defaultSettings, ...data } as Settings;
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
};

export const fetchPhotos = async (limitCount?: number): Promise<Photo[]> => {
  try {
    const colRef = collection(db, 'photos');
    const q = limitCount ? query(colRef, limit(limitCount)) : query(colRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapDoc<Photo>(doc));
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
};

export const fetchWritings = async (limitCount?: number): Promise<Writing[]> => {
  try {
    const colRef = collection(db, 'writings');
    const q = limitCount ? query(colRef, limit(limitCount)) : query(colRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapDoc<Writing>(doc));
  } catch (error) {
    console.error("Error fetching writings:", error);
    return [];
  }
};

export const fetchProjects = async (limitCount?: number): Promise<Project[]> => {
  try {
    const colRef = collection(db, 'projects');
    const q = limitCount ? query(colRef, limit(limitCount)) : query(colRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapDoc<Project>(doc));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const addPhoto = async (data: Omit<Photo, 'id'>) => {
  return await addDoc(collection(db, 'photos'), data);
};

export const addWriting = async (data: Omit<Writing, 'id'>) => {
  return await addDoc(collection(db, 'writings'), data);
};

export const addProject = async (data: Omit<Project, 'id'>) => {
  return await addDoc(collection(db, 'projects'), data);
};

export const updateSettings = async (settings: Settings) => {
  const { 
    bio, longBio, education, location, email, whatsappNumber, // 🔴 NEW: Extracted whatsappNumber
    heroImageUrl, heroAnimation, heroBorderColor, heroAnimColor, heroAnimColor2, contentScale, language, socialLinks, theme
  } = settings;

  const data = { 
    bio, longBio, education, location, email, whatsappNumber, // 🔴 NEW: Saved whatsappNumber
    heroImageUrl, heroAnimation, heroBorderColor, heroAnimColor, heroAnimColor2, contentScale, language, socialLinks, theme
  };

  return await setDoc(doc(db, 'settings', 'config'), data, { merge: true }); 
};

// ==========================================
// 🔴 NEW: COMMENT SYSTEM FUNCTIONS
// ==========================================

// Fetch comments (If itemId is passed, fetch specific item's comments. Else fetch all for Admin)
export const fetchComments = async (itemId?: string): Promise<Comment[]> => {
  try {
    const colRef = collection(db, 'comments');
    let q;
    if (itemId) {
      // Fetch specific item's comments (e.g., specific project or photo)
      q = query(colRef, where('itemId', '==', itemId), orderBy('createdAt', 'desc'));
    } else {
      // Fetch all comments for Admin panel
      q = query(colRef, orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapDoc<Comment>(doc));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

// Add a new comment
export const addComment = async (data: Omit<Comment, 'id'>) => {
  return await addDoc(collection(db, 'comments'), data);
};

// Update comment status (e.g., approve or pin)
export const updateComment = async (id: string, updates: Partial<Comment>) => {
  const docRef = doc(db, 'comments', id);
  return await updateDoc(docRef, updates);
};

// Delete a comment
export const deleteComment = async (id: string) => {
  const docRef = doc(db, 'comments', id);
  return await deleteDoc(docRef);
};
