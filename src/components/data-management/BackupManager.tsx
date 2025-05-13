/**
 * Backup Manager Component
 * 
 * Provides an interface for users to view, create, and restore backups
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Archive, RotateCcw, Trash2, Download, Shield, AlertCircle, 
  Clock, RefreshCw, CheckCircle, CloudOff, Database 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { 
  BackupMetadata, 
  BackupSettings 
} from '@/utils/autoBackup';
import autoBackupManager from '@/utils/autoBackup';
import { DataCategory } from '@/utils/superPersistentStorage';

export function BackupManager() {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<'restore' | 'delete' | null>(null);
  const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);
  const [settingsChanged, setSettingsChanged] = useState(false);
  
  // Load backups and settings on mount
  useEffect(() => {
    loadBackups();
    loadSettings();
  }, []);
  
  // Load backup list
  const loadBackups = () => {
    setLoading(true);
    try {
      const backupList = autoBackupManager.getBackupList();
      setBackups(backupList);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load backup list. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Load backup settings
  const loadSettings = () => {
    try {
      const settings = autoBackupManager.getSettings();
      setBackupSettings(settings);
    } catch (error) {
      console.error('Error loading backup settings:', error);
    }
  };
  
  // Create a new backup
  const createBackup = async () => {
    setCreating(true);
    try {
      const backup = await autoBackupManager.performBackup();
      
      if (backup) {
        // Add to list
        setBackups(prev => [backup, ...prev]);
        
        toast({
          title: 'Backup Created',
          description: backup.status === 'complete'
            ? 'Successfully created a full backup of your data.'
            : 'Created a partial backup. Some data may not be included.',
          duration: 4000
        });
      } else {
        toast({
          title: 'Backup Failed',
          description: 'Failed to create backup. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Backup Failed',
        description: 'An error occurred while creating the backup.',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };
  
  // Restore a backup
  const handleRestore = async () => {
    if (!selectedBackupId) return;
    
    setRestoring(true);
    try {
      const result = await autoBackupManager.restoreBackup(selectedBackupId);
      
      if (result.success) {
        setConfirmDialog(null);
        
        if (result.failedCategories.length > 0) {
          toast({
            title: 'Partial Restore',
            description: `Restored ${result.restoredCategories.length} categories. ${result.failedCategories.length} categories failed.`,
            duration: 4000
          });
        } else {
          toast({
            title: 'Restore Successful',
            description: 'Successfully restored all data from the backup.',
            duration: 4000
          });
        }
      } else {
        toast({
          title: 'Restore Failed',
          description: 'Failed to restore data from the backup.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast({
        title: 'Restore Failed',
        description: 'An error occurred during the restore process.',
        variant: 'destructive'
      });
    } finally {
      setRestoring(false);
    }
  };
  
  // Delete a backup
  const handleDelete = async () => {
    if (!selectedBackupId) return;
    
    setDeleting(true);
    try {
      const success = await autoBackupManager.deleteBackup(selectedBackupId);
      
      if (success) {
        // Remove from list
        setBackups(prev => prev.filter(b => b.id !== selectedBackupId));
        setConfirmDialog(null);
        
        toast({
          title: 'Backup Deleted',
          description: 'The backup has been deleted successfully.',
          duration: 3000
        });
      } else {
        toast({
          title: 'Delete Failed',
          description: 'Failed to delete the backup. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast({
        title: 'Delete Failed',
        description: 'An error occurred while deleting the backup.',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };
  
  // Update backup settings
  const updateSettings = () => {
    if (!backupSettings) return;
    
    try {
      autoBackupManager.updateSettings(backupSettings);
      setSettingsChanged(false);
      
      toast({
        title: 'Settings Updated',
        description: 'Backup settings have been updated successfully.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating backup settings:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update backup settings.',
        variant: 'destructive'
      });
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp');
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: BackupMetadata['status']) => {
    switch (status) {
      case 'complete':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" /> Complete
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="h-3 w-3 mr-1" /> Partial
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        );
    }
  };
  
  // Get location badges
  const getLocationBadges = (locations: ('local' | 'cloud')[]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {locations.includes('local') && (
          <Badge variant="secondary" className="h-5">
            <Database className="h-3 w-3 mr-1" /> Local
          </Badge>
        )}
        {locations.includes('cloud') && (
          <Badge variant="secondary" className="h-5">
            <Shield className="h-3 w-3 mr-1" /> Cloud
          </Badge>
        )}
        {locations.length === 0 && (
          <Badge variant="outline" className="h-5">
            <CloudOff className="h-3 w-3 mr-1" /> None
          </Badge>
        )}
      </div>
    );
  };
  
  // Get backup interval options in hours
  const intervalOptions = [
    { value: 1, label: '1 hour' },
    { value: 3, label: '3 hours' },
    { value: 6, label: '6 hours' },
    { value: 12, label: '12 hours' },
    { value: 24, label: '24 hours' },
    { value: 48, label: '2 days' },
    { value: 72, label: '3 days' },
    { value: 168, label: '1 week' },
  ];
  
  return (
    <div className="space-y-8">
      {/* Backup Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Backup Management
          </CardTitle>
          <CardDescription>
            Create, view, and restore backups of your business data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Available Backups</h3>
                <p className="text-sm text-muted-foreground">
                  {backups.length} {backups.length === 1 ? 'backup' : 'backups'} available
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadBackups} 
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  onClick={createBackup} 
                  disabled={creating || loading}
                >
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Create Backup
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <Separator />
            
            {loading ? (
              // Skeleton loader
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-9 w-9 rounded-md" />
                      <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center p-8 bg-muted/50 rounded-md">
                <Archive className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <h3 className="font-medium mb-1">No Backups Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't created any backups yet. Create a backup to protect your data.
                </p>
                <Button onClick={createBackup} disabled={creating}>
                  {creating ? 'Creating Backup...' : 'Create First Backup'}
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div 
                      key={backup.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            Backup from {formatDate(backup.timestamp)}
                          </h4>
                          {getStatusBadge(backup.status)}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-y-2 sm:gap-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Database className="h-3 w-3 mr-1" />
                            {backup.categories.length} categories
                          </span>
                          <span className="flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            {Math.round(backup.size / 1024)} KB
                          </span>
                          <div>
                            {getLocationBadges(backup.location)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBackupId(backup.id);
                            setConfirmDialog('restore');
                          }}
                          className="flex-1 sm:flex-initial"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBackupId(backup.id);
                            setConfirmDialog('delete');
                          }}
                          className="flex-1 sm:flex-initial"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Backup Settings */}
      {backupSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Backup Settings
            </CardTitle>
            <CardDescription>
              Configure automatic backup frequency and storage options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="auto-backup" className="flex flex-col space-y-1">
                  <span>Automatic Backups</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    Create backups of your data at regular intervals
                  </span>
                </Label>
                <Switch
                  id="auto-backup"
                  checked={backupSettings.enabled}
                  onCheckedChange={(checked) => {
                    setBackupSettings(prev => prev ? { ...prev, enabled: checked } : null);
                    setSettingsChanged(true);
                  }}
                />
              </div>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="backup-interval" className="text-right">
                    Backup Frequency
                  </Label>
                  <Select
                    disabled={!backupSettings.enabled}
                    value={(backupSettings.interval / (60 * 60 * 1000)).toString()}
                    onValueChange={(value) => {
                      const hours = parseInt(value);
                      setBackupSettings(prev => prev ? {
                        ...prev,
                        interval: hours * 60 * 60 * 1000 // Convert hours to milliseconds
                      } : null);
                      setSettingsChanged(true);
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {intervalOptions.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="local-storage" className="text-right">
                    Local Storage
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="local-storage"
                      disabled={!backupSettings.enabled}
                      checked={backupSettings.storeLocal}
                      onCheckedChange={(checked) => {
                        setBackupSettings(prev => prev ? { ...prev, storeLocal: checked } : null);
                        setSettingsChanged(true);
                      }}
                    />
                    <Label htmlFor="local-storage" className="text-sm text-muted-foreground">
                      Store backups on this device
                    </Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cloud-storage" className="text-right">
                    Cloud Storage
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="cloud-storage"
                      disabled={!backupSettings.enabled}
                      checked={backupSettings.storeCloud}
                      onCheckedChange={(checked) => {
                        setBackupSettings(prev => prev ? { ...prev, storeCloud: checked } : null);
                        setSettingsChanged(true);
                      }}
                    />
                    <Label htmlFor="cloud-storage" className="text-sm text-muted-foreground">
                      Store backups in the cloud
                    </Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="auto-delete" className="text-right">
                    Auto Cleanup
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="auto-delete"
                      disabled={!backupSettings.enabled}
                      checked={backupSettings.autoDeleteOldBackups}
                      onCheckedChange={(checked) => {
                        setBackupSettings(prev => prev ? { ...prev, autoDeleteOldBackups: checked } : null);
                        setSettingsChanged(true);
                      }}
                    />
                    <Label htmlFor="auto-delete" className="text-sm text-muted-foreground">
                      Automatically delete old backups
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={updateSettings} 
              disabled={!settingsChanged}
            >
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Restore Confirmation Dialog */}
      <Dialog open={confirmDialog === 'restore'} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this backup? This will replace your current data with the data from the backup.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <p className="font-medium">Warning</p>
                <p>Restoring a backup will replace your current data. This action cannot be undone.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
              disabled={restoring}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestore}
              disabled={restoring}
            >
              {restoring ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialog === 'delete'} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
