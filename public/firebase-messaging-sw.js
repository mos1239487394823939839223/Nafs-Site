importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// TODO: Replace with your actual Firebase config
// These values should ideally be injected during build, but for Service Workers we often hardcode 
// or use URL params. Since Vite doesn't process public/SW natively without plugins,
// you MUST paste your config here manually for background notifications to work.
const firebaseConfig = {
  apiKey: "AIzaSyAWjOE3rAVbxWk-nfKClvL0U4Lri4Gmlq4",
  authDomain: "nafas-73152.firebaseapp.com",
  projectId: "nafas-73152",
  storageBucket: "nafas-73152.firebasestorage.app",
  messagingSenderId: "309781858748",
  appId: "1:309781858748:web:7a09882ec98d38b55e03b9"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Background message handler
  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body,
      icon: '/vite.svg', // Replace with your app logo
      data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch(e) {
  console.warn("Failed to initialize Firebase in service worker. Did you forget to add the config?", e);
}
