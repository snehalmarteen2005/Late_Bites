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
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
