
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RotateLeft } from 'lucide-react';

interface UserPreference {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  sidebar: {
    expanded: boolean;
  };
  notifications: {
    email: boolean;
    app: boolean;
    browser: boolean;
  };
}

interface AppSettings {
  // App-specific settings
}

interface SettingsData {
  userPreferences: UserPreference;
  appSettings: AppSettings;
}

// Simplified for this example
const useSettingsWithSync = () => {
  const loadSettings = async (): Promise<SettingsData> => {
    // In a real implementation, this would load from storage
    return {
      userPreferences: {
        theme: 'system',
        language: 'en',
        currency: 'ZAR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        sidebar: {
          expanded: true
        },
        notifications: {
          email: true,
          app: true,
          browser: false
        }
      },
      appSettings: {}
    };
  };

  const saveSettings = async (): Promise<boolean> => {
    return true;
  };

  const updateUserPreferences = async (): Promise<boolean> => {
    return true;
  };

  const updateAppSettings = async (): Promise<boolean> => {
    return true;
  };

  const resetSettings = async (): Promise<boolean> => {
    return true;
  };

  return {
    loadSettings,
    saveSettings,
    updateUserPreferences,
    updateAppSettings,
    resetSettings
  };
};

// Simplified sync status hook
const useSyncStatus = () => {
  return {
    showSyncing: () => {},
    showSuccess: () => {},
    showError: () => {}
  };
};

const SettingsPanel: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setError] = useState<string | null>(null);
  
  // Get the sync-enabled settings adapter functions
  const { 
    loadSettings, 
    saveSettings, 
    updateUserPreferences, 
    updateAppSettings,
    resetSettings 
  } = useSettingsWithSync();
  
  // Get sync context for manual operations if needed
  const { showSyncing, showSuccess, showError } = useSyncStatus();

  // Load settings when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await loadSettings();
        if (settings && settings.userPreferences) {
          setPreferences(settings.userPreferences);
          setAppSettings(settings.appSettings);
        } else {
          setError('Failed to load settings');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setError('Error loading settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [loadSettings]);

  // Handle theme preference change
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (preferences) {
      setPreferences({ ...preferences, theme });
    }
  };

  // Handle language preference change
  const handleLanguageChange = (language: string) => {
    if (preferences) {
      setPreferences({ 
        ...preferences, 
        language
      });
    }
  };

  // Handle currency preference change
  const handleCurrencyChange = (currency: string) => {
    if (preferences) {
      setPreferences({ 
        ...preferences, 
        currency
      });
    }
  };

  // Handle date format preference change
  const handleDateFormatChange = (dateFormat: string) => {
    if (preferences) {
      setPreferences({ 
        ...preferences, 
        dateFormat
      });
    }
  };

  // Handle notification preferences change
  const handleNotificationChange = (type: keyof UserPreference['notifications']) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [type]: !preferences.notifications[type]
        }
      });
    }
  };

  // Handle sidebar expanded preference change
  const handleSidebarExpandedChange = (checked: boolean) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        sidebar: {
          ...preferences.sidebar,
          expanded: checked
        }
      });
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!preferences) return;
    
    try {
      // The sync status will be automatically shown by the adapter
      const success = await updateUserPreferences(preferences);
      if (success) {
        setSaveSuccess(true);
      } else {
        setError('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Error saving settings');
    }
  };

  // Reset settings to defaults
  const handleResetSettings = async () => {
    try {
      // The sync status will be automatically shown by the adapter
      const success = await resetSettings();
      if (success) {
        // Reload settings after reset
        const newSettings = await loadSettings();
        if (newSettings && newSettings.userPreferences) {
          setPreferences(newSettings.userPreferences);
          setAppSettings(newSettings.appSettings);
          setSaveSuccess(true);
        }
      } else {
        setError('Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      setError('Error resetting settings');
    }
  };

  // Close success message
  const handleCloseSuccess = () => {
    setSaveSuccess(false);
  };

  // Close error message
  const handleCloseError = () => {
    setError(null);
  };

  // If still loading, show loading state
  if (isLoading || !preferences) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg">Loading settings...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="locale">Language & Format</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-4">
            <h3 className="text-lg font-medium">Theme & Appearance</h3>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={preferences.theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('light')}
                className="w-full"
              >
                Light
              </Button>
              
              <Button 
                variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('dark')}
                className="w-full"
              >
                Dark
              </Button>
              
              <Button 
                variant={preferences.theme === 'system' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('system')}
                className="w-full"
              >
                System
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch 
                id="sidebar-expanded"
                checked={preferences.sidebar.expanded}
                onCheckedChange={handleSidebarExpandedChange}
              />
              <Label htmlFor="sidebar-expanded">Expanded sidebar by default</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="locale" className="space-y-4">
            <h3 className="text-lg font-medium">Language & Format</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language-select">Language</Label>
                <Select 
                  value={preferences.language} 
                  onValueChange={handleLanguageChange}
                >
                  <SelectTrigger id="language-select">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="af">Afrikaans</SelectItem>
                    <SelectItem value="xh">isiXhosa</SelectItem>
                    <SelectItem value="zu">isiZulu</SelectItem>
                    <SelectItem value="st">Sesotho</SelectItem>
                    <SelectItem value="tn">Setswana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency-select">Currency</Label>
                <Select 
                  value={preferences.currency}
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger id="currency-select">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZAR">South African Rand (ZAR)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    <SelectItem value="BWP">Botswana Pula (BWP)</SelectItem>
                    <SelectItem value="NAD">Namibian Dollar (NAD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-format-select">Date Format</Label>
                <Select 
                  value={preferences.dateFormat}
                  onValueChange={handleDateFormatChange}
                >
                  <SelectTrigger id="date-format-select">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time-format-select">Time Format</Label>
                <Select value={preferences.timeFormat}>
                  <SelectTrigger id="time-format-select">
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="email-notifications"
                  checked={preferences.notifications.email}
                  onCheckedChange={() => handleNotificationChange('email')}
                />
                <Label htmlFor="email-notifications">Email notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="app-notifications"
                  checked={preferences.notifications.app}
                  onCheckedChange={() => handleNotificationChange('app')}
                />
                <Label htmlFor="app-notifications">In-app notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="browser-notifications"
                  checked={preferences.notifications.browser}
                  onCheckedChange={() => handleNotificationChange('browser')}
                />
                <Label htmlFor="browser-notifications">Browser notifications</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline"
            onClick={handleResetSettings}
            className="flex items-center gap-2"
          >
            <RotateLeft className="h-4 w-4" />
            Reset to Defaults
          </Button>
          
          <Button 
            onClick={handleSaveSettings}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
        
        {saveSuccess && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Settings saved successfully!</AlertDescription>
          </Alert>
        )}
        
        {saveError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
