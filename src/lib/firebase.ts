import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrFyfZZGvNakU0j5f_ywZ8V5O4eQzpyvg",
  authDomain: "first-firebase-app-e2f8f.firebaseapp.com",
  projectId: "first-firebase-app-e2f8f",
  storageBucket: "first-firebase-app-e2f8f.firebasestorage.app",
  messagingSenderId: "681590074678",
  appId: "1:681590074678:web:01b6e1416c2ddb14435797"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, provider, db };
