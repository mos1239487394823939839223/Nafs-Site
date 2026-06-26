import * as signalR from '@microsoft/signalr';

const BASE_URL = (import.meta.env.VITE_BASE_URL || 'https://api.nafas-site.tech').replace(/\/$/, '');
const HUB_URL = `${BASE_URL}/hubs/chat`;

// ─── Token helper (same logic as api.js) ─────────────────────────────────────
function getAuthToken() {
  try {
    const stored = localStorage.getItem('auth');
    if (!stored) return null;
    const { token } = JSON.parse(stored);
    if (!token) return null;
    // Strip "Bearer " prefix if accidentally stored with it
    if (typeof token === 'string' && token.toLowerCase().startsWith('bearer ')) {
      return token.substring(7).trim();
    }
    return token || null;
  } catch {
    return null;
  }
}

// ─── Singleton connection instance ────────────────────────────────────────────
let _connection = null;
let _startPromise = null;
// Single-slot reference to the chat-UI ReceiveMessage handler (see below).
let _chatMessageHandler = null;

/**
 * Returns a SignalR HubConnection.
 * Calling this multiple times returns the same instance (singleton).
 */
export function getChatConnection() {
  if (_connection) return _connection;

  _connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => getAuthToken(),
      // Skip negotiation to avoid CORS issues if server allows it
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(
      import.meta.env.DEV
        ? signalR.LogLevel.Information
        : signalR.LogLevel.Warning
    )
    .build();

  return _connection;
}

/**
 * Starts the connection if it is not already connected.
 * Safe to call multiple times.
 */
export async function startChatConnection() {
  const conn = getChatConnection();

  if (conn.state === signalR.HubConnectionState.Connected) return conn;

  if (conn.state === signalR.HubConnectionState.Disconnected) {
    if (!_startPromise) {
      _startPromise = conn.start().finally(() => {
        _startPromise = null;
      });
    }
    await _startPromise;
  } else if (_startPromise) {
    await _startPromise;
  }

  return conn;
}

/**
 * Subscribe the chat UI to incoming messages with a SINGLE-SLOT guarantee:
 * registering a new handler always removes the previously registered chat
 * handler first. This makes the chat listener immune to duplicate registration
 * from React StrictMode, repeated mounts, or Vite HMR/Fast-Refresh leaving stale
 * handlers on the long-lived singleton connection — without disturbing other
 * `ReceiveMessage` subscribers (e.g. the notification context).
 *
 * @param {(msg: any) => void} handler
 * @returns {() => void} unsubscribe
 */
export function subscribeToChatMessages(handler) {
  const conn = getChatConnection();
  if (_chatMessageHandler) {
    conn.off('ReceiveMessage', _chatMessageHandler);
  }
  _chatMessageHandler = handler;
  // The SignalR JS client matches method names case-insensitively (stored
  // lowercased), so 'ReceiveMessage' also handles a backend 'receivemessage'.
  conn.on('ReceiveMessage', handler);

  return () => {
    if (_chatMessageHandler === handler) {
      conn.off('ReceiveMessage', handler);
      _chatMessageHandler = null;
    }
  };
}

/**
 * Gracefully stops and destroys the singleton so the next call to
 * getChatConnection() creates a fresh instance (use on logout).
 */
export async function stopChatConnection() {
  _chatMessageHandler = null;
  if (_connection) {
    const connectionToStop = _connection;
    try {
      if (_startPromise) await _startPromise.catch(() => {});
      await connectionToStop.stop();
    } catch {
      // ignore
    }
    if (_connection === connectionToStop) _connection = null;
    _startPromise = null;
  }
}

// Dev-only safety: when this module is hot-replaced, tear down the singleton so
// stale event listeners can't accumulate on a long-lived connection across HMR.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopChatConnection();
  });
}
