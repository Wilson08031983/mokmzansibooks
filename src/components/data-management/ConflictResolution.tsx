/**
 * Data Conflict Resolution Component
 * 
 * Provides an interface for users to view and resolve data conflicts
 * between local and server versions.
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataVersion, resolveConflicts, getDataVersions } from '@/utils/dataRecovery';
import { DataCategory } from '@/utils/superPersistentStorage';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface ConflictResolutionProps {
  isOpen: boolean;
  onClose: () => void;
  category: DataCategory;
  onResolved: () => void;
}

export function ConflictResolution({ isOpen, onClose, category, onResolved }: ConflictResolutionProps) {
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [versions, setVersions] = useState<DataVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('data');
  
  // Load data versions when the dialog opens
  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, category]);
  
  async function loadVersions() {
    setLoading(true);
    try {
      const dataVersions = await getDataVersions(category);
      setVersions(dataVersions);
      
      // Default to local version if available
      const localVersion = dataVersions.find(v => v.source === 'local');
      if (localVersion) {
        setSelectedVersion('local');
      } else if (dataVersions.length > 0) {
        setSelectedVersion(dataVersions[0].source);
      }
    } catch (error) {
      console.error('Error loading data versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data versions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }
  
  function formatTimestamp(timestamp: string): string {
    try {
      return format(new Date(timestamp), 'PPpp');
    } catch (error) {
      return 'Unknown date';
    }
  }
  
  function getSourceLabel(source: string): string {
    switch (source) {
      case 'local':
        return 'Local Device';
      case 'server':
        return 'Cloud Server';
      case 'backup':
        return 'Backup Copy';
      default:
        return source;
    }
  }
  
  async function handleResolve() {
    if (!selectedVersion) {
      toast({
        title: 'Selection Required',
        description: 'Please select a version to use for resolving the conflict.',
        variant: 'destructive'
      });
      return;
    }
    
    setResolving(true);
    
    try {
      const options = {
        preferLocal: selectedVersion === 'local',
        preferServer: selectedVersion === 'server',
        preferNewer: false,
        manual: false
      };
      
      const success = await resolveConflicts(category, options);
      
      if (success) {
        toast({
          title: 'Conflict Resolved',
          description: `The ${category} data has been successfully synchronized.`
        });
        onResolved();
        onClose();
      } else {
        toast({
          title: 'Resolution Failed',
          description: 'Failed to resolve the conflict. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: 'Resolution Failed',
        description: 'An error occurred while resolving the conflict.',
        variant: 'destructive'
      });
    } finally {
      setResolving(false);
    }
  }
  
  function formatJSON(json: any): string {
    try {
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return 'Invalid JSON';
    }
  }
  
  // Helper function to get the selected version object
  function getSelectedVersionData(): DataVersion | undefined {
    return versions.find(v => v.source === selectedVersion);
  }
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Data Conflict Detected</DialogTitle>
          <DialogDescription>
            There's a conflict between local and server data for {category}. 
            Please review the differences and select which version to keep.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading data versions...</span>
          </div>
        ) : (
          <div className="grid gap-4 py-4 overflow-hidden flex-1 flex flex-col">
            <RadioGroup 
              value={selectedVersion} 
              onValueChange={setSelectedVersion}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {versions.map((version) => (
                <div 
                  key={version.source}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedVersion === version.source ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedVersion(version.source)}
                >
                  <RadioGroupItem 
                    value={version.source} 
                    id={version.source}
                    className="sr-only"
                  />
                  <Label htmlFor={version.source} className="cursor-pointer">
                    <div className="font-semibold text-lg">{getSourceLabel(version.source)}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Last Updated: {formatTimestamp(version.timestamp)}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {selectedVersion && (
              <Tabs defaultValue="data" value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                <TabsList>
                  <TabsTrigger value="data">Data Preview</TabsTrigger>
                  <TabsTrigger value="json">Raw JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="data" className="flex-1 overflow-auto">
                  <div className="bg-muted p-4 rounded-md h-[300px] overflow-auto">
                    <h3 className="text-lg font-semibold mb-2">Preview of {getSourceLabel(selectedVersion)} Data</h3>
                    <div className="mt-4">
                      {getSelectedVersionData()?.data ? (
                        <DataPreview data={getSelectedVersionData()?.data} />
                      ) : (
                        <div className="text-muted-foreground">No data available</div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="json" className="flex-1 overflow-auto">
                  <pre className="bg-muted p-4 rounded-md h-[300px] overflow-auto text-xs">
                    {formatJSON(getSelectedVersionData()?.data)}
                  </pre>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={resolving}>
            Cancel
          </Button>
          <Button 
            onClick={handleResolve} 
            disabled={!selectedVersion || resolving || loading}
          >
            {resolving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Use Selected Version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Render a preview of the data in a structured format
 */
function DataPreview({ data }: { data: any }) {
  if (!data) return <div>No data</div>;
  
  // Remove metadata fields for the preview
  const { _meta, ...displayData } = data;
  
  // Helper to check if a value should be rendered directly
  const isSimpleValue = (value: any) => 
    typeof value !== 'object' || value === null;
  
  // Render object properties recursively
  const renderObject = (obj: any, depth = 0) => {
    if (!obj || typeof obj !== 'object') return null;
    
    return (
      <div style={{ marginLeft: `${depth * 16}px` }}>
        {Object.entries(obj).map(([key, value]) => {
          // Skip metadata
          if (key === '_meta') return null;
          
          return (
            <div key={key} className="mb-1">
              <span className="font-medium">{key}: </span>
              {isSimpleValue(value) ? (
                <span>{String(value)}</span>
              ) : Array.isArray(value) ? (
                <div>
                  {(value as any[]).map((item, index) => (
                    <div key={index} className="ml-4">
                      {isSimpleValue(item) ? String(item) : renderObject(item, depth + 1)}
                    </div>
                  ))}
                </div>
              ) : (
                renderObject(value, depth + 1)
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  return renderObject(displayData);
}
