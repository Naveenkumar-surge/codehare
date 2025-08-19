import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyCkLx8KrXlohjveokVarQXUD4McV_6pu-U",
  authDomain: "whiteboard-app-1e266.firebaseapp.com",
  projectId: "whiteboard-app-1e266",
  storageBucket: "whiteboard-app-1e266.appspot.com",
  messagingSenderId: "903660154745",
  appId: "1:903660154745:web:255bc12ea2a3b2dd6c9a8",
  measurementId: "G-W2P7GCQ878"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app); // ✅ Add Firestore Database

// Google Sign-In Function
export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);
      return result.user;
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
};

// ✅ Sign Out Function (Fixed)
export const logout = async () => {
    if (!auth.currentUser) {
        console.warn("No user is logged in!");
        return;
    }

    try {
        await signOut(auth);
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

export default app;
