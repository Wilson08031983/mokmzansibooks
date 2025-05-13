
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CloudCog, CheckCircle2, AlertCircle, CloudOff } from "lucide-react";

export enum SyncStatus {
  SYNCING = 'syncing',
  SYNCED = 'synced',
  OFFLINE = 'offline',
  ERROR = 'error',
  IDLE = 'idle'
}

export interface SyncIndicatorProps {
  status: SyncStatus | 'syncing' | 'synced' | 'offline' | 'error' | 'idle';
  lastSynced?: string;
  pendingChanges?: number;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ 
  status, 
  lastSynced, 
  pendingChanges = 0 
}) => {
  const [formattedTime, setFormattedTime] = useState<string>('');
  
  useEffect(() => {
    if (lastSynced) {
      const formatTime = () => {
        const synced = new Date(lastSynced);
        const now = new Date();
        const diffMs = now.getTime() - synced.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) {
          return 'just now';
        } else if (diffMins < 60) {
          return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        } else {
          const diffHours = Math.floor(diffMins / 60);
          if (diffHours < 24) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
          } else {
            return synced.toLocaleDateString() + ' ' + synced.toLocaleTimeString();
          }
        }
      };
      
      setFormattedTime(formatTime());
      
      const timer = setInterval(() => {
        setFormattedTime(formatTime());
      }, 60000); // Update every minute
      
      return () => clearInterval(timer);
    }
  }, [lastSynced]);
  
  let icon;
  let label;
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let tooltipText;
  
  switch (status) {
    case SyncStatus.SYNCING:
    case 'syncing':
      icon = <CloudCog className="h-4 w-4 animate-spin" />;
      label = 'Syncing';
      badgeVariant = "secondary";
      tooltipText = `Syncing your data${pendingChanges ? ` (${pendingChanges} changes pending)` : ''}`;
      break;
    case SyncStatus.SYNCED:
    case 'synced':
      icon = <CheckCircle2 className="h-4 w-4" />;
      label = 'Synced';
      badgeVariant = "outline";
      tooltipText = `All changes saved${lastSynced ? ` (Last: ${formattedTime})` : ''}`;
      break;
    case SyncStatus.OFFLINE:
    case 'offline':
      icon = <CloudOff className="h-4 w-4" />;
      label = 'Offline';
      badgeVariant = "secondary";
      tooltipText = `You're working offline${pendingChanges ? ` (${pendingChanges} changes will sync when you reconnect)` : ''}`;
      break;
    case SyncStatus.ERROR:
    case 'error':
      icon = <AlertCircle className="h-4 w-4" />;
      label = 'Sync Error';
      badgeVariant = "destructive";
      tooltipText = `There was an error syncing your data${pendingChanges ? ` (${pendingChanges} changes pending)` : ''}`;
      break;
    case SyncStatus.IDLE:
    case 'idle':
    default:
      icon = <CheckCircle2 className="h-4 w-4" />;
      label = 'Ready';
      badgeVariant = "outline";
      tooltipText = 'Your data is ready';
      break;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={badgeVariant} className="gap-1.5">
            {icon}
            <span className="text-xs">{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncIndicator;
