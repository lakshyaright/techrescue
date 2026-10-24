import React, { createContext, useContext, useState, useEffect } from 'react';
import { InAppNotification } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/mockData';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('techrescue_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('techrescue_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const userNotifications = notifications.filter(
    n => n.userId === currentUser.id || currentUser.role === 'ADMIN'
  );

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n =>
        n.userId === currentUser.id || currentUser.role === 'ADMIN'
          ? { ...n, read: true }
          : n
      )
    );
  };

  const addNotification = (notif: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: InAppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
