import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000/ws';

let socket: Socket | null = null;

// ── CONNECTION MANAGEMENT ───────────────────────────────────────────────

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  const token = getAccessToken();

  if (!token) {
    console.warn('[WS] Cannot connect without access token');
    return s;
  }

  // Set auth token for the handshake (server validates on connect)
  s.auth = { token };

  if (!s.connected) {
    s.connect();
  }

  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

// ── TEAM ROOM SUBSCRIPTIONS ─────────────────────────────────────────────

export function joinTeamRoom(teamId: string) {
  getSocket().emit('team:join', { teamId });
}

export function leaveTeamRoom(teamId: string) {
  getSocket().emit('team:leave', { teamId });
}
