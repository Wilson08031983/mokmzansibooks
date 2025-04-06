
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFinancialData } from '@/contexts/FinancialDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  read: boolean;
  link?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { vatReturns, payeReturns, taxDeadlines, taxDocuments } = useFinancialData();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Also show a toast for new notifications
    toast({
      title: notification.title,
      description: notification.message,
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Check for upcoming tax deadlines (within 7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const upcomingDeadlines = taxDeadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.date);
      return deadlineDate >= today && deadlineDate <= nextWeek;
    });

    // Add notifications for upcoming deadlines
    upcomingDeadlines.forEach(deadline => {
      const daysLeft = Math.ceil((new Date(deadline.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if we already have this notification
      const exists = notifications.some(n => 
        n.title.includes(deadline.title) && n.message.includes(`${daysLeft} day`)
      );
      
      if (!exists) {
        addNotification({
          title: `Upcoming Deadline: ${deadline.title}`,
          message: `You have ${daysLeft} day${daysLeft === 1 ? '' : 's'} left to complete this task.`,
          type: daysLeft <= 2 ? 'warning' : 'info',
          link: '/tax/calendar',
        });
      }
    });

    // Check for due tax returns
    const dueVatReturns = vatReturns.filter(item => item.status === "Due");
    const duePayeReturns = payeReturns.filter(item => item.status === "Due");
    
    if (dueVatReturns.length > 0) {
      const exists = notifications.some(n => n.title.includes('VAT Returns Due'));
      
      if (!exists) {
        addNotification({
          title: 'VAT Returns Due',
          message: `You have ${dueVatReturns.length} VAT return${dueVatReturns.length === 1 ? '' : 's'} that need to be submitted.`,
          type: 'warning',
          link: '/tax/vat-returns',
        });
      }
    }
    
    if (duePayeReturns.length > 0) {
      const exists = notifications.some(n => n.title.includes('PAYE Returns Due'));
      
      if (!exists) {
        addNotification({
          title: 'PAYE Returns Due',
          message: `You have ${duePayeReturns.length} PAYE return${duePayeReturns.length === 1 ? '' : 's'} that need to be submitted.`,
          type: 'warning',
          link: '/tax/paye',
        });
      }
    }

    // Check for trial expiration if user is on trial
    if (currentUser?.subscriptionStatus === 'trial' && currentUser?.trialEndsAt) {
      const trialEndDate = new Date(currentUser.trialEndsAt);
      const daysLeft = Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 7 && daysLeft > 0) {
        const exists = notifications.some(n => n.title.includes('Trial Ending Soon'));
        
        if (!exists) {
          addNotification({
            title: 'Trial Ending Soon',
            message: `Your trial period will end in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Upgrade now to continue using all features.`,
            type: daysLeft <= 3 ? 'warning' : 'info',
            link: '/settings',
          });
        }
      }
    }

    // Check for document expiration (assuming documents have expiration dates)
    // For demonstration, we'll consider a document expires 1 year after upload
    taxDocuments.forEach(doc => {
      const uploadDate = new Date(doc.uploadDate);
      const expiryDate = new Date(uploadDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry <= 30 && daysToExpiry > 0) {
        const exists = notifications.some(n => 
          n.title.includes('Document Expiring') && n.message.includes(doc.name)
        );
        
        if (!exists) {
          addNotification({
            title: 'Document Expiring Soon',
            message: `"${doc.name}" will expire in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'}.`,
            type: daysToExpiry <= 7 ? 'warning' : 'info',
            link: '/tax/documents',
          });
        }
      }
    });
  }, [vatReturns, payeReturns, taxDeadlines, taxDocuments, currentUser]);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      clearNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};
