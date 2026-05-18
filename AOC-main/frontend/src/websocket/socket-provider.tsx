'use client';

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';
import { getSocket, connectSocket, disconnectSocket } from './socket';
import { useAuthStore } from '@/store/auth.store';
import { activityKeys, notificationKeys } from '@/hooks/use-data';
import { teamKeys } from '@/hooks/use-teams';
import type { Activity, Notification } from '@/types';

// ── CONTEXT ─────────────────────────────────────────────────────────────

const SocketContext = createContext<Socket | null>(null);

export function useSocket() {
  return useContext(SocketContext);
}

// ── PROVIDER ────────────────────────────────────────────────────────────

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      disconnectSocket();
      return;
    }

    // Connect and register presence
    const socket = connectSocket();
    socketRef.current = socket;

    // ── LISTEN: New activity → update React Query cache ───────────────
    socket.on('activity:new', (activity: Activity) => {
      // Prepend to global feed cache
      queryClient.setQueryData(activityKeys.global(1), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [activity, ...old.data.slice(0, 19)],
        };
      });
    });

    // ── LISTEN: New notification → update cache + show toast ──────────
    socket.on('notification:new', (notification: Notification) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      // TODO: integrate with toast/notification UI
    });

    // ── LISTEN: Team update → invalidate team cache ──────────────────
    socket.on('team:update', (data: { event: string; data: any }) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    });

    // ── LISTEN: Presence → could update online indicator ─────────────
    socket.on('presence:update', (data: { onlineCount: number; onlineUserIds: string[] }) => {
      // Can be stored in a Zustand store if needed for UI
    });

    // Cleanup on unmount or auth change
    return () => {
      socket.off('activity:new');
      socket.off('notification:new');
      socket.off('team:update');
      socket.off('presence:update');
      disconnectSocket();
    };
  }, [isAuthenticated, user?.id, queryClient]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}
