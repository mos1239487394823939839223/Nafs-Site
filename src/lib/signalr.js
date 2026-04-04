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

  if (
    conn.state === signalR.HubConnectionState.Disconnected
  ) {
    await conn.start();
  }

  return conn;
}

/**
 * Gracefully stops and destroys the singleton so the next call to
 * getChatConnection() creates a fresh instance (use on logout).
 */
export async function stopChatConnection() {
  if (_connection) {
    try {
      await _connection.stop();
    } catch {
      // ignore
    }
    _connection = null;
  }
}
