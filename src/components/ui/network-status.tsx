/**
 * NetworkStatusIndicator Component
 * 
 * Displays the current network status (online/offline) and pending sync count
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudCog } from 'lucide-react';
import syncManager from '@/utils/syncManager';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(syncManager.isNetworkOnline());
  const [pendingCount, setPendingCount] = useState(syncManager.getPendingSyncCount());

  useEffect(() => {
    // Update state when network status changes
    const updateStatus = () => {
      setIsOnline(syncManager.isNetworkOnline());
      setPendingCount(syncManager.getPendingSyncCount());
    };

    // Initial status
    updateStatus();

    // Add listener for future updates
    syncManager.addListener(updateStatus);

    // Clean up on unmount
    return () => {
      syncManager.removeListener(updateStatus);
    };
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex items-center p-2">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-500" />
            )}
            
            {pendingCount > 0 && (
              <>
                <CloudCog className="h-4 w-4 text-blue-500" />
                <Badge variant="secondary" className="h-5 min-w-5 flex items-center justify-center">
                  {pendingCount}
                </Badge>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isOnline ? 'Online' : 'Offline'}</p>
          {pendingCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {pendingCount} {pendingCount === 1 ? 'item' : 'items'} pending sync
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
