import React, { useState } from 'react';
import { useNotifications, Notification } from '@/contexts/NotificationsContext';
import { Bell, Check, Calendar, FileText, Info, AlertTriangle, Clock, CreditCard, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    setOpen(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (message: string) => {
    if (message.includes("credit") || message.includes("Credit"))
      return <CreditCard className="h-4 w-4 text-green-500" />;
    if (message.includes("Overdue") || message.includes("overdue"))
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (message.includes("client") || message.includes("Client"))
      return <Users className="h-4 w-4 text-blue-500" />;
    if (message.includes("Deadline") || message.includes("calendar") || message.includes("due"))
      return <Calendar className="h-4 w-4 text-amber-500" />;
    if (message.includes("document") || message.includes("Document"))
      return <FileText className="h-4 w-4 text-purple-500" />;
    
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const getNotificationClass = (type: Notification['type'], read: boolean) => {
    let baseClass = "p-3 transition-colors rounded-md";
    
    if (!read) {
      baseClass += " bg-muted/50";
    } else {
      baseClass += " hover:bg-muted/30";
    }
    
    return baseClass;
  };

  const categorizedNotifications = notifications.reduce((acc, notification) => {
    const isOverdue = notification.message.includes("overdue") || notification.message.includes("Overdue");
    const isCredit = notification.message.includes("credit") || notification.message.includes("Credit");
    const isClient = notification.message.includes("client") || notification.message.includes("Client");
    const isDeadline = notification.message.includes("Deadline") || notification.message.includes("deadline");
    const isDocument = notification.message.includes("document") || notification.message.includes("Document");
    
    if (isOverdue) {
      acc.overdue.push(notification);
    } else if (isCredit) {
      acc.credit.push(notification);
    } else if (isClient) {
      acc.clients.push(notification);
    } else if (isDeadline) {
      acc.deadlines.push(notification);
    } else if (isDocument) {
      acc.documents.push(notification);
    } else {
      acc.other.push(notification);
    }
    
    return acc;
  }, { 
    overdue: [] as Notification[], 
    credit: [] as Notification[], 
    clients: [] as Notification[], 
    deadlines: [] as Notification[],
    documents: [] as Notification[],
    other: [] as Notification[] 
  });

  const overdueCount = categorizedNotifications.overdue.filter(n => !n.read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1.5 h-5 min-w-5 flex items-center justify-center"
              variant={overdueCount > 0 ? "overdue" : "destructive"}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[80vh]">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[60vh] overflow-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {categorizedNotifications.overdue.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Overdue
                  </div>
                  {categorizedNotifications.overdue.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={getNotificationClass(notification.type, notification.read)}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3 w-full">
                        <div className="flex-shrink-0 mt-1">
                          {getCategoryIcon(notification.message)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {categorizedNotifications.credit.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Credits
                  </div>
                  {categorizedNotifications.credit.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={getNotificationClass(notification.type, notification.read)}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3 w-full">
                        <div className="flex-shrink-0 mt-1">
                          {getCategoryIcon(notification.message)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {Object.entries({
                "Clients": categorizedNotifications.clients,
                "Deadlines": categorizedNotifications.deadlines,
                "Documents": categorizedNotifications.documents,
                "Other": categorizedNotifications.other
              }).map(([category, items]) => 
                items.length > 0 ? (
                  <React.Fragment key={category}>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                      {category}
                    </div>
                    {items.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={getNotificationClass(notification.type, notification.read)}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3 w-full">
                          <div className="flex-shrink-0 mt-1">
                            {getCategoryIcon(notification.message)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between">
                              <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </React.Fragment>
                ) : null
              )}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
