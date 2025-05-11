import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Switch, 
  FormControlLabel, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  TextField, 
  Button, 
  Grid,
  Stack,
  IconButton,
  AlertTitle,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  DarkMode, 
  LightMode, 
  RotateLeft, 
  Save, 
  Notifications, 
  Language, 
  AttachMoney 
} from '@mui/icons-material';
import { 
  UserPreference,
  AppSettings, 
  SettingsData
} from '../../utils/settingsStorageAdapter';
import { useSettingsWithSync } from '../../contexts/integrateStorageAdapters';
import { useSyncStatus } from '../../contexts/SyncContext';
import { SyncStatus } from '../shared/SyncIndicator';

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
  const handleLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (preferences) {
      setPreferences({ 
        ...preferences, 
        language: event.target.value as string 
      });
    }
  };

  // Handle currency preference change
  const handleCurrencyChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (preferences) {
      setPreferences({ 
        ...preferences, 
        currency: event.target.value as string 
      });
    }
  };

  // Handle date format preference change
  const handleDateFormatChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (preferences) {
      setPreferences({ 
        ...preferences, 
        dateFormat: event.target.value as string 
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
  const handleSidebarExpandedChange = () => {
    if (preferences) {
      setPreferences({
        ...preferences,
        sidebar: {
          ...preferences.sidebar,
          expanded: !preferences.sidebar.expanded
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
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Application Settings
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Theme Settings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Theme & Appearance
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <IconButton 
              color={preferences.theme === 'light' ? 'primary' : 'default'} 
              onClick={() => handleThemeChange('light')}
            >
              <LightMode />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton 
              color={preferences.theme === 'dark' ? 'primary' : 'default'} 
              onClick={() => handleThemeChange('dark')}
            >
              <DarkMode />
            </IconButton>
          </Grid>
          <Grid item xs>
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.theme === 'system'} 
                  onChange={() => handleThemeChange('system')}
                />
              }
              label="Use system theme"
            />
          </Grid>
        </Grid>
        
        <FormControlLabel
          control={
            <Switch 
              checked={preferences.sidebar.expanded} 
              onChange={handleSidebarExpandedChange}
            />
          }
          label="Expanded sidebar by default"
        />
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Language & Format Settings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Language & Format
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="language-select-label">
                <Language sx={{ mr: 1 }} fontSize="small" />
                Language
              </InputLabel>
              <Select
                labelId="language-select-label"
                value={preferences.language}
                onChange={handleLanguageChange}
                label="Language"
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="af">Afrikaans</MenuItem>
                <MenuItem value="xh">isiXhosa</MenuItem>
                <MenuItem value="zu">isiZulu</MenuItem>
                <MenuItem value="st">Sesotho</MenuItem>
                <MenuItem value="tn">Setswana</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="currency-select-label">
                <AttachMoney sx={{ mr: 1 }} fontSize="small" />
                Currency
              </InputLabel>
              <Select
                labelId="currency-select-label"
                value={preferences.currency}
                onChange={handleCurrencyChange}
                label="Currency"
              >
                <MenuItem value="ZAR">South African Rand (ZAR)</MenuItem>
                <MenuItem value="USD">US Dollar (USD)</MenuItem>
                <MenuItem value="EUR">Euro (EUR)</MenuItem>
                <MenuItem value="GBP">British Pound (GBP)</MenuItem>
                <MenuItem value="BWP">Botswana Pula (BWP)</MenuItem>
                <MenuItem value="NAD">Namibian Dollar (NAD)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="date-format-select-label">Date Format</InputLabel>
              <Select
                labelId="date-format-select-label"
                value={preferences.dateFormat}
                onChange={handleDateFormatChange}
                label="Date Format"
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                <MenuItem value="DD-MMM-YYYY">DD-MMM-YYYY</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="time-format-select-label">Time Format</InputLabel>
              <Select
                labelId="time-format-select-label"
                value={preferences.timeFormat}
                label="Time Format"
              >
                <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                <MenuItem value="24h">24-hour</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Notification Settings */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
          Notifications
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.notifications.email} 
                  onChange={() => handleNotificationChange('email')}
                />
              }
              label="Email notifications"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.notifications.app} 
                  onChange={() => handleNotificationChange('app')}
                />
              }
              label="In-app notifications"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={preferences.notifications.browser} 
                  onChange={() => handleNotificationChange('browser')}
                />
              }
              label="Browser notifications"
            />
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          color="secondary" 
          startIcon={<RotateLeft />}
          onClick={handleResetSettings}
        >
          Reset to Defaults
        </Button>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Save />}
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={saveSuccess} 
        autoHideDuration={6000} 
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success">
          Settings saved successfully!
        </Alert>
      </Snackbar>
      
      {/* Error Alert */}
      {saveError && (
        <Alert 
          severity="error" 
          onClose={handleCloseError}
          sx={{ mt: 2 }}
        >
          <AlertTitle>Error</AlertTitle>
          {saveError}
        </Alert>
      )}
    </Paper>
  );
};

export default SettingsPanel;
