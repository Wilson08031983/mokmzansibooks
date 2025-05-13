
import React from 'react';
import { Cloud, CloudOff, CloudSync, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export interface SyncIndicatorProps {
  status: SyncStatus;
  message?: string;
  className?: string;
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({ 
  status, 
  message = '', 
  className = '' 
}) => {
  const getIcon = () => {
    switch (status) {
      case SyncStatus.SYNCING:
        return <CloudSync className="animate-spin" />;
      case SyncStatus.SUCCESS:
        return <CheckCircle className="text-green-500" />;
      case SyncStatus.ERROR:
        return <AlertCircle className="text-red-500" />;
      case SyncStatus.OFFLINE:
        return <CloudOff className="text-gray-500" />;
      case SyncStatus.IDLE:
      default:
        return <Cloud className="text-blue-500" />;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case SyncStatus.SYNCING:
        return 'text-blue-600';
      case SyncStatus.SUCCESS:
        return 'text-green-600';
      case SyncStatus.ERROR:
        return 'text-red-600';
      case SyncStatus.OFFLINE:
        return 'text-gray-500';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-2 px-2 py-1 rounded-md text-xs', 
      getStatusClass(),
      className
    )}>
      {getIcon()}
      {message && <span>{message}</span>}
    </div>
  );
};

export default SyncIndicator;
