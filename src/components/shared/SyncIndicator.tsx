
import React from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error'
}

interface SyncIndicatorProps {
  status: SyncStatus;
  message?: string;
  className?: string;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ 
  status, 
  message = '', 
  className 
}) => {
  // Don't show anything if idle and no message
  if (status === SyncStatus.IDLE && !message) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm rounded-md py-1 px-2",
      status === SyncStatus.SYNCING && "bg-blue-50 text-blue-700",
      status === SyncStatus.SUCCESS && "bg-green-50 text-green-700",
      status === SyncStatus.ERROR && "bg-red-50 text-red-700",
      className
    )}>
      {status === SyncStatus.SYNCING && (
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      )}
      
      {status === SyncStatus.SUCCESS && (
        <Check className="h-4 w-4 text-green-600" />
      )}
      
      {status === SyncStatus.ERROR && (
        <AlertCircle className="h-4 w-4 text-red-600" />
      )}
      
      <span>
        {message || getDefaultMessage(status)}
      </span>
    </div>
  );
};

// Get default message based on status
function getDefaultMessage(status: SyncStatus): string {
  switch (status) {
    case SyncStatus.SYNCING:
      return 'Syncing...';
    case SyncStatus.SUCCESS:
      return 'Sync successful';
    case SyncStatus.ERROR:
      return 'Sync failed';
    default:
      return '';
  }
}

export default SyncIndicator;
