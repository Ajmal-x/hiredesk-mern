import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface NotificationItem {
  _id: string;
  type: 'application' | 'status' | 'job' | 'system';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: NotificationItem[];
  unreadCount: number;
}

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.get<NotificationsResponse>(
        '/notifications',
      );

      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetchNotifications();

    const interval = window.setInterval(() => {
      void fetchNotifications();
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [enabled, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification,
        ),
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      // Keep the current notification state if the request fails.
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        })),
      );

      setUnreadCount(0);
    } catch {
      // Keep the current notification state if the request fails.
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((current) =>
        current.filter(
          (notification) => notification._id !== id,
        ),
      );

      const deletedNotification = notifications.find(
        (notification) => notification._id === id,
      );

      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch {
      // Keep the current notification state if the request fails.
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}