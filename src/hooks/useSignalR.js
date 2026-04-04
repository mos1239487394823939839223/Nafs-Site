import { useEffect, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { getChatConnection, startChatConnection } from '../lib/signalr';

/**
 * useSignalR
 *
 * Manages the lifecycle of the chat SignalR connection for the duration of the
 * component that uses it.  Provides helpers to:
 *   - subscribe to server-push events
 *   - invoke hub methods
 *
 * @param {object} options
 * @param {boolean}  options.enabled     – connect only when true (default: true)
 * @param {object}   options.handlers    – { eventName: handlerFn, … }
 *
 * @returns {{ invoke, connectionState }}
 */
export function useSignalR({ enabled = true, handlers = {} } = {}) {
  const connectionRef = useRef(null);
  const handlersRef = useRef(handlers);

  // Keep handler refs fresh without re-running the effect
  useEffect(() => {
    handlersRef.current = handlers;
  });

  // ── Connect & register event handlers ─────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    async function connect() {
      try {
        const conn = getChatConnection();
        connectionRef.current = conn;

        // Register all event listeners provided by the caller
        const eventNames = Object.keys(handlersRef.current);
        eventNames.forEach((event) => {
          conn.on(event, (...args) => {
            if (isMounted && handlersRef.current[event]) {
              handlersRef.current[event](...args);
            }
          });
        });

        await startChatConnection();

        if (import.meta.env.DEV) {
          console.log('[SignalR] Connected. State:', conn.state);
        }
      } catch (err) {
        console.error('[SignalR] Connection error:', err);
      }
    }

    connect();

    return () => {
      isMounted = false;
      // Remove listeners registered by this hook instance
      const conn = connectionRef.current;
      if (conn) {
        Object.keys(handlersRef.current).forEach((event) => {
          conn.off(event);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // ── Invoke a hub method ────────────────────────────────────────────────────
  const invoke = useCallback(async (method, ...args) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      console.warn('[SignalR] Not connected – cannot invoke:', method);
      return;
    }
    return conn.invoke(method, ...args);
  }, []);

  // ── Expose current connection state ───────────────────────────────────────
  const connectionState = connectionRef.current?.state ?? signalR.HubConnectionState.Disconnected;

  return { invoke, connectionState };
}
