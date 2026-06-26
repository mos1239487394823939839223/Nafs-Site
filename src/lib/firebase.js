import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is provided
let app, messaging;

console.log("🔥 Firebase Config Loaded:", firebaseConfig);

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
} catch (error) {
  console.warn("Firebase config is missing or invalid. Notifications will not work until you add the config in .env");
}

export const getFirebaseToken = async () => {
  if (!messaging) return null;
  console.log("🔑 VAPID KEY:", import.meta.env.VITE_FIREBASE_VAPID_KEY);
  try {
    const currentToken = await getToken(messaging, { 
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
    });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

/**
 * Subscribe to foreground FCM messages with a SINGLE registration.
 * Returns an unsubscribe function. Unlike the one-shot promise pattern, this
 * registers `onMessage` exactly once so listeners can't accumulate (which would
 * make a single push fire the callback multiple times).
 *
 * @param {(payload: any) => void} callback
 * @returns {() => void} unsubscribe
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};
