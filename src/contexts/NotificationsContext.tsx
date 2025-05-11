import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFinancialData } from '@/contexts/FinancialDataContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  timestamp: string | Date;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
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
  const { currentUser } = useSupabaseAuth();
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

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // Check for duplicate notifications (same title and similar message)
    const isDuplicate = notifications.some(n => 
      n.title === notification.title && 
      n.message.includes(notification.message.substring(0, 20))
    );
    
    if (isDuplicate) {
      // Skip adding duplicate notifications
      return;
    }
    
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    // Limit the number of notifications to prevent excessive buildup
    setNotifications(prev => {
      const newNotifications = [newNotification, ...prev];
      // Keep only the 100 most recent notifications
      return newNotifications.slice(0, 100);
    });
    
    // Also show a toast for new notifications
    toast({
      title: notification.title,
      description: notification.message,
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };
  
  // Clean up duplicate and excessive notifications
  const cleanupNotifications = () => {
    // Get unique notifications by title and first 20 chars of message
    const uniqueMap = new Map<string, Notification>();
    
    notifications.forEach(notification => {
      const key = `${notification.title}-${notification.message.substring(0, 20)}`;
      if (!uniqueMap.has(key) || new Date(notification.timestamp) > new Date(uniqueMap.get(key)!.timestamp)) {
        uniqueMap.set(key, notification);
      }
    });
    
    // Get unique notifications and sort by timestamp (newest first)
    const uniqueNotifications = Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Limit to 100 notifications maximum
    const limitedNotifications = uniqueNotifications.slice(0, 100);
    
    // Only update if there's a change in the notifications
    if (limitedNotifications.length !== notifications.length) {
      setNotifications(limitedNotifications);
    }
  };

  // Load notifications from localStorage on initial mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        // Only keep notifications from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentNotifications = parsedNotifications.filter((notification: Notification) => {
          const notificationDate = new Date(notification.timestamp);
          return notificationDate >= thirtyDaysAgo;
        });
        
        // Get unique notifications by title and first 20 chars of message
        const uniqueMap = new Map<string, Notification>();
        
        recentNotifications.forEach(notification => {
          const key = `${notification.title}-${notification.message.substring(0, 20)}`;
          if (!uniqueMap.has(key) || new Date(notification.timestamp) > new Date(uniqueMap.get(key)!.timestamp)) {
            uniqueMap.set(key, notification);
          }
        });
        
        // Get unique notifications and sort by timestamp (newest first)
        const uniqueNotifications = Array.from(uniqueMap.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Limit to maximum 100 notifications
        const limitedNotifications = uniqueNotifications.slice(0, 100);
        setNotifications(limitedNotifications);
      } catch (error) {
        console.error('Error parsing saved notifications:', error);
        // If there's an error, reset notifications
        localStorage.removeItem('notifications');
      }
    }
    
    // Run cleanup once on mount to fix any existing notification issues
    setTimeout(() => cleanupNotifications(), 1000);
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Generate system notifications - run this only once per day
  useEffect(() => {
    // Use localStorage to track when we last generated notifications
    const lastGenerated = localStorage.getItem('lastNotificationsGenerated');
    const today = new Date();
    const todayString = today.toDateString();
    
    // Only generate notifications once per day
    if (lastGenerated !== todayString) {
      // Get a snapshot of current notifications to check for duplicates
      const currentNotifications = [...notifications];
      let notificationsAdded = false;
      
      // Check for upcoming tax deadlines (within 7 days)
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
        const exists = currentNotifications.some(n => 
          n.title.includes(deadline.title) && n.message.includes(`${daysLeft} day`)
        );
        
        if (!exists) {
          addNotification({
            title: `Upcoming Deadline: ${deadline.title}`,
            message: `You have ${daysLeft} day${daysLeft === 1 ? '' : 's'} left to complete this task.`,
            type: daysLeft <= 2 ? 'warning' : 'info',
            link: '/tax/calendar',
          });
          notificationsAdded = true;
        }
      });

      // Check for due tax returns
      const dueVatReturns = vatReturns.filter(item => item.status === "Due");
      const duePayeReturns = payeReturns.filter(item => item.status === "Due");
      
      if (dueVatReturns.length > 0) {
        const exists = currentNotifications.some(n => n.title.includes('VAT Returns Due'));
        
        if (!exists) {
          addNotification({
            title: 'VAT Returns Due',
            message: `You have ${dueVatReturns.length} VAT return${dueVatReturns.length === 1 ? '' : 's'} that need to be submitted.`,
            type: 'warning',
            link: '/tax/vat-returns',
          });
          notificationsAdded = true;
        }
      }
      
      if (duePayeReturns.length > 0) {
        const exists = currentNotifications.some(n => n.title.includes('PAYE Returns Due'));
        
        if (!exists) {
          addNotification({
            title: 'PAYE Returns Due',
            message: `You have ${duePayeReturns.length} PAYE return${duePayeReturns.length === 1 ? '' : 's'} that need to be submitted.`,
            type: 'warning',
            link: '/tax/paye',
          });
          notificationsAdded = true;
        }
      }

      // Check for trial expiration if user is on trial
      const subscriptionStatus = currentUser?.user_metadata?.subscription_status || 
                               currentUser?.app_metadata?.subscription_status;
      const trialEndsAt = currentUser?.user_metadata?.trial_ends_at || 
                        currentUser?.app_metadata?.trial_ends_at;
                        
      if (subscriptionStatus === 'trial' && trialEndsAt) {
        const trialEndDate = new Date(trialEndsAt);
        const daysLeft = Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 7 && daysLeft > 0) {
          const exists = currentNotifications.some(n => n.title.includes('Trial Ending Soon'));
          
          if (!exists) {
            addNotification({
              title: 'Trial Ending Soon',
              message: `Your trial period will end in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Upgrade now to continue using all features.`,
              type: daysLeft <= 3 ? 'warning' : 'info',
              link: '/settings',
            });
            notificationsAdded = true;
          }
        }
      }

      // Check for document expiration (assuming documents have expiration dates)
      taxDocuments.forEach(doc => {
        const uploadDate = new Date(doc.uploadDate);
        const expiryDate = new Date(uploadDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysToExpiry <= 30 && daysToExpiry > 0) {
          const exists = currentNotifications.some(n => 
            n.title.includes('Document Expiring') && n.message.includes(doc.name)
          );
          
          if (!exists) {
            addNotification({
              title: 'Document Expiring Soon',
              message: `"${doc.name}" will expire in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'}.`,
              type: daysToExpiry <= 7 ? 'warning' : 'info',
              link: '/tax/documents',
            });
            notificationsAdded = true;
          }
        }
      });
      
      // Only update the last generated timestamp if we actually added notifications
      // or if we checked everything and found no notifications to add
      localStorage.setItem('lastNotificationsGenerated', todayString);
    }
  }, [vatReturns, payeReturns, taxDeadlines, taxDocuments, currentUser, addNotification]);

  // Run the cleanup function periodically to prevent excessive notifications
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cleanupNotifications();
    }, 60000); // Run every minute
    
    return () => clearInterval(cleanupInterval);
  }, [notifications]);
  
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
