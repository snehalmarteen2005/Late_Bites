/**
 * Firebase Configuration for Late Bites
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Click "Create a project" (or "Add project")
 * 3. Name it "late-bites" → Continue → Disable Google Analytics → Create
 * 4. In the left sidebar click "Build" → "Realtime Database"
 * 5. Click "Create Database" → Select region → Start in TEST MODE → Enable
 * 6. Go to Project Settings (gear icon) → Scroll to "Your apps" → Click web icon (</>)
 * 7. Register app name "late-bites-web" → Copy the firebaseConfig object below
 * 8. Paste your values replacing the placeholders below
 */

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBnh2cwcxmuJ6Oc0ip1V7k_v2ZvRCIQFKc",
  authDomain: "latebites-8c423.firebaseapp.com",
  databaseURL: "https://latebites-8c423-default-rtdb.firebaseio.com",
  projectId: "latebites-8c423",
  storageBucket: "latebites-8c423.firebasestorage.app",
  messagingSenderId: "341035515640",
  appId: "1:341035515640:web:243834eda92beb7936050d"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
