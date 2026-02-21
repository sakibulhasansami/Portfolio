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
  getDoc
} from 'firebase/firestore';
import { Photo, Writing, Settings, Project } from '../types';

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
    bio, longBio, education, location, email,
    heroImageUrl, heroAnimation, heroBorderColor, heroAnimColor, heroAnimColor2, contentScale, language, socialLinks, theme
  } = settings;

  const data = { 
    bio, longBio, education, location, email,
    heroImageUrl, heroAnimation, heroBorderColor, heroAnimColor, heroAnimColor2, contentScale, language, socialLinks, theme
  };

  return await setDoc(doc(db, 'settings', 'config'), data, { merge: true }); 
};
