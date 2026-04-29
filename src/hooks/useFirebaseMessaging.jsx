import { useState, useEffect, useCallback } from 'react';
import { getFirebaseToken, onMessageListener } from '../lib/firebase';
import { notificationAPI } from '../lib/api';
import toast from 'react-hot-toast';

export const useFirebaseMessaging = (isAuthenticated, onNotificationReceived) => {
  const [fcmToken, setFcmToken] = useState(null);

  const requestPermissionAndGetToken = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getFirebaseToken();
        if (token) {
          setFcmToken(token);
          // Save token to backend (swallows errors if backend is not ready)
          await notificationAPI.saveDeviceToken(token).catch(err => console.warn("Failed to save token to backend:", err));
          
          // Store locally to handle logout deletion later
          localStorage.setItem('fcm_token', token);
        }
      } else {
        console.warn("Notification permission denied.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Check if browser supports notifications
      if ('Notification' in window) {
        requestPermissionAndGetToken();
      }

      // Set up foreground message listener
      const setupMessageListener = () => {
        onMessageListener().then((payload) => {
          // Show toast for foreground notification
          toast(
            (t) => (
              <div className="flex flex-col gap-1">
                <span className="font-bold">{payload.notification?.title || 'New Notification'}</span>
                <span className="text-sm">{payload.notification?.body}</span>
              </div>
            ),
            { duration: 4000, position: 'top-right' }
          );
          
          if (onNotificationReceived) {
            onNotificationReceived(payload);
          }

          // Re-register listener for the next message
          setupMessageListener();
        }).catch(err => console.log('failed: ', err));
      };

      setupMessageListener();
    }
  }, [isAuthenticated, requestPermissionAndGetToken, onNotificationReceived]);

  return { fcmToken, requestPermissionAndGetToken };
};
