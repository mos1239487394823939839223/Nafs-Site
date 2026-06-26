import { useState, useEffect, useRef } from 'react';
import { getFirebaseToken, onForegroundMessage } from '../lib/firebase';
import { notificationAPI } from '../lib/api';
import toast from 'react-hot-toast';

export const useFirebaseMessaging = (isAuthenticated, onNotificationReceived, onTokenRegistered) => {
  const [fcmToken, setFcmToken] = useState(null);
  const onNotificationReceivedRef = useRef(onNotificationReceived);
  const onTokenRegisteredRef = useRef(onTokenRegistered);

  useEffect(() => { onNotificationReceivedRef.current = onNotificationReceived; }, [onNotificationReceived]);
  useEffect(() => { onTokenRegisteredRef.current = onTokenRegistered; }, [onTokenRegistered]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const requestPermissionAndGetToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getFirebaseToken();
          if (token) {
            setFcmToken(token);
            await notificationAPI.saveDeviceToken(token).catch(err => console.warn("Failed to save token to backend:", err));
            localStorage.setItem('fcm_token', token);
            if (onTokenRegisteredRef.current) onTokenRegisteredRef.current();
          }
        } else {
          console.warn("Notification permission denied.");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    if ('Notification' in window) {
      requestPermissionAndGetToken();
    }

    // Register the foreground listener ONCE; the unsubscribe is returned and run
    // on cleanup so listeners never accumulate (which would handle one push N times).
    const unsubscribe = onForegroundMessage((payload) => {
      toast(
        () => (
          <div className="flex flex-col gap-1">
            <span className="font-bold">{payload.notification?.title || 'New Notification'}</span>
            <span className="text-sm">{payload.notification?.body}</span>
          </div>
        ),
        { duration: 4000, position: 'top-right' }
      );
      if (onNotificationReceivedRef.current) {
        onNotificationReceivedRef.current(payload);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isAuthenticated]);

  return { fcmToken };
};
