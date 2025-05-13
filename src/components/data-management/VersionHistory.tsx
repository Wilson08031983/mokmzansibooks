/**
 * Version History Component
 * 
 * Displays a list of previous versions for a data category
 * and allows restoring to previous versions.
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Clock, UserRound, RotateCcw, ChevronDown, ChevronRight, 
  FileText, AlertCircle, CheckCircle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { DataCategory } from '@/utils/superPersistentStorage';
import { 
  DataVersion, 
  VersionMetadata, 
  getVersionHistory, 
  restoreVersion 
} from '@/utils/dataVersioning';

interface VersionHistoryProps {
  category: DataCategory;
  onVersionRestored?: () => void;
}

export function VersionHistory({ category, onVersionRestored }: VersionHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<DataVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DataVersion | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  
  useEffect(() => {
    loadVersionHistory();
  }, [category]);
  
  const loadVersionHistory = async () => {
    setLoading(true);
    try {
      const history = await getVersionHistory(category);
      setVersions(history);
    } catch (error) {
      console.error('Error loading version history:', error);
      toast({
        title: 'Failed to load version history',
        description: 'There was an error loading the version history. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp');
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  const handleRestoreClick = (version: DataVersion) => {
    setSelectedVersion(version);
    setConfirmDialogOpen(true);
  };
  
  const confirmRestore = async () => {
    if (!selectedVersion) return;
    
    setRestoring(true);
    try {
      const success = await restoreVersion(category, selectedVersion.id);
      if (success) {
        setConfirmDialogOpen(false);
        // Reload the version history
        await loadVersionHistory();
        // Notify parent component
        if (onVersionRestored) {
          onVersionRestored();
        }
      }
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Failed to restore version',
        description: 'There was an error restoring the selected version. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRestoring(false);
    }
  };
  
  const getFieldChangeBadges = (changedFields: string[]) => {
    if (!changedFields || changedFields.length === 0) {
      return <Badge variant="outline">No changes recorded</Badge>;
    }
    
    // Group similar fields
    const fieldGroups: Record<string, number> = {};
    changedFields.forEach(field => {
      const mainField = field.split('.')[0];
      fieldGroups[mainField] = (fieldGroups[mainField] || 0) + 1;
    });
    
    return Object.entries(fieldGroups).map(([field, count]) => (
      <Badge 
        key={field} 
        variant="secondary" 
        className="mr-1 mb-1"
        title={changedFields.filter(f => f.startsWith(field)).join(', ')}
      >
        {field} {count > 1 ? `(${count})` : ''}
      </Badge>
    ));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">{category} Version History</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadVersionHistory} 
          disabled={loading}
        >
          <RotateCcw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {loading ? (
        // Skeleton loader
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col space-y-2 p-4 border rounded-md">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center p-8 bg-muted/50 rounded-md">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <h3 className="font-medium mb-1">No Version History</h3>
          <p className="text-sm text-muted-foreground">
            No previous versions found for this data category.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <Accordion type="single" collapsible className="space-y-3">
            {versions.map((version, index) => (
              <AccordionItem
                key={version.id}
                value={version.id}
                className="border rounded-lg overflow-hidden"
              >
                <div className={`border-l-4 ${index === 0 ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                    <div className="flex flex-col items-start flex-1 text-left">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        {index === 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Current
                          </Badge>
                        ) : (
                          <Badge variant="outline">Version {version.metadata.version}</Badge>
                        )}
                        <span className="mx-2">•</span>
                        <span className="text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(version.metadata.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center">
                        <UserRound className="h-3 w-3 mr-1" />
                        {version.metadata.userName || 'Unknown User'}
                        <span className="mx-2">•</span>
                        {version.metadata.changeDescription || 'Data updated'}
                      </div>
                    </div>
                  </AccordionTrigger>
                </div>
                
                <AccordionContent className="bg-muted/20">
                  <div className="px-4 py-3 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Changed Fields</h4>
                      <div className="flex flex-wrap">
                        {getFieldChangeBadges(version.metadata.changedFields)}
                      </div>
                    </div>
                    
                    {index > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRestoreClick(version)}
                        className="mt-2"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore This Version
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      )}
      
      {/* Restore confirmation dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Previous Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore to version {selectedVersion?.metadata.version}?
              This will replace your current data with the selected version.
            </DialogDescription>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="py-3">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Version Details</p>
                  <p>Created on {formatDate(selectedVersion.metadata.timestamp)}</p>
                  <p>By {selectedVersion.metadata.userName}</p>
                  <p>{selectedVersion.metadata.changeDescription}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={restoring}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={confirmRestore}
              disabled={restoring}
            >
              {restoring ? 'Restoring...' : 'Restore Version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
