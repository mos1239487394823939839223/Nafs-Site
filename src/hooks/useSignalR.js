import { useEffect, useRef, useCallback, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getChatConnection, startChatConnection } from "../lib/signalr";

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
export function useSignalR({
  enabled = true,
  handlers = {},
  disconnectOnUnmount = false,
  onConnectionError = null,
} = {}) {
  const connectionRef = useRef(null);
  const handlersRef = useRef(handlers);
  const listenerRefs = useRef([]);
  const [connectionState, setConnectionState] = useState(
    signalR.HubConnectionState.Disconnected,
  );

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
        setConnectionState(conn.state);

        // Register all event listeners provided by the caller
        const eventNames = Object.keys(handlersRef.current);
        eventNames.forEach((event) => {
          const callback = (...args) => {
            if (isMounted && handlersRef.current[event]) {
              handlersRef.current[event](...args);
            }
          };
          conn.on(event, callback);
          listenerRefs.current.push({ event, callback });
        });

        await startChatConnection();
        if (isMounted) {
          setConnectionState(conn.state);
        }

        if (import.meta.env.DEV) {
          console.log("[SignalR] Connected. State:", conn.state);
        }
      } catch (err) {
        const errorMessage = String(err?.message || "").toLowerCase();
        const expectedAbort =
          err?.name === "AbortError" ||
          errorMessage.includes("before stop() was called");

        if (!expectedAbort) {
          console.error("[SignalR] Connection error:", err);
        } else if (import.meta.env.DEV) {
          console.debug("[SignalR] Start/stop race (dev):", err?.message || err);
        }

        if (typeof onConnectionError === "function") {
          onConnectionError(err);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      // Remove listeners registered by this hook instance
      const conn = connectionRef.current;
      if (conn) {
        listenerRefs.current.forEach(({ event, callback }) => {
          conn.off(event, callback);
        });
        listenerRefs.current = [];

        if (disconnectOnUnmount) {
          conn.stop().catch(() => {});
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, disconnectOnUnmount, onConnectionError]);

  // ── Invoke a hub method ────────────────────────────────────────────────────
  const invoke = useCallback(async (method, ...args) => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      console.warn("[SignalR] Not connected – cannot invoke:", method);
      return;
    }
    return conn.invoke(method, ...args);
  }, []);

  return { invoke, connectionState };
}
