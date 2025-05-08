import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Mail, 
  MessageCircle, 
  Smartphone, 
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const NotificationPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    invoiceAlerts: true,
    marketingCommunications: false
  });

  const togglePreference = (key: keyof typeof preferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(newPreferences);

    toast({
      title: 'Notification Preferences Updated',
      description: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} has been ${newPreferences[key] ? 'enabled' : 'disabled'}.`,
      variant: 'default'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notification Preferences
        </CardTitle>
        <CardDescription>
          Customize how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span>Email Notifications</span>
            </div>
            <Switch 
              checked={preferences.emailNotifications}
              onCheckedChange={() => togglePreference('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <span>SMS Notifications</span>
            </div>
            <Switch 
              checked={preferences.smsNotifications}
              onCheckedChange={() => togglePreference('smsNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <span>Push Notifications</span>
            </div>
            <Switch 
              checked={preferences.pushNotifications}
              onCheckedChange={() => togglePreference('pushNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <span>Invoice Alerts</span>
            </div>
            <Switch 
              checked={preferences.invoiceAlerts}
              onCheckedChange={() => togglePreference('invoiceAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <span>Marketing Communications</span>
            </div>
            <Switch 
              checked={preferences.marketingCommunications}
              onCheckedChange={() => togglePreference('marketingCommunications')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
