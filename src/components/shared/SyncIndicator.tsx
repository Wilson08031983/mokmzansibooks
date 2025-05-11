import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Fade, Tooltip } from '@mui/material';
import { SyncOutlined, CheckCircleOutlined, ErrorOutline } from '@mui/icons-material';

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error'
}

interface SyncIndicatorProps {
  status?: SyncStatus;
  message?: string;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'fixed';
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  status = SyncStatus.IDLE,
  message,
  position = 'bottom-right'
}) => {
  const [visible, setVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<SyncStatus>(status);
  const [statusMessage, setStatusMessage] = useState<string | undefined>(message);

  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return { top: 16, right: 16 };
      case 'top-left':
        return { top: 16, left: 16 };
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'fixed':
        return { position: 'static' };
      case 'bottom-right':
      default:
        return { bottom: 16, right: 16 };
    }
  };

  // Update status and visibility when props change
  useEffect(() => {
    setCurrentStatus(status);
    
    if (message) {
      setStatusMessage(message);
    }

    // Show indicator when syncing, success, or error
    if (status !== SyncStatus.IDLE) {
      setVisible(true);
      
      // Auto-hide after success or error
      if (status === SyncStatus.SUCCESS || status === SyncStatus.ERROR) {
        const timer = setTimeout(() => {
          setVisible(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [status, message]);

  // Get the appropriate icon based on status
  const getStatusIcon = () => {
    switch (currentStatus) {
      case SyncStatus.SYNCING:
        return <CircularProgress size={20} color="inherit" />;
      case SyncStatus.SUCCESS:
        return <CheckCircleOutlined color="success" />;
      case SyncStatus.ERROR:
        return <ErrorOutline color="error" />;
      case SyncStatus.IDLE:
      default:
        return <SyncOutlined />;
    }
  };

  // Get the appropriate text color based on status
  const getTextColor = () => {
    switch (currentStatus) {
      case SyncStatus.SUCCESS:
        return 'success.main';
      case SyncStatus.ERROR:
        return 'error.main';
      case SyncStatus.SYNCING:
        return 'info.main';
      case SyncStatus.IDLE:
      default:
        return 'text.secondary';
    }
  };

  // Get the default status message if none provided
  const getDefaultMessage = () => {
    switch (currentStatus) {
      case SyncStatus.SYNCING:
        return 'Saving data...';
      case SyncStatus.SUCCESS:
        return 'Data saved successfully';
      case SyncStatus.ERROR:
        return 'Error saving data';
      case SyncStatus.IDLE:
      default:
        return 'All changes saved';
    }
  };

  return (
    <Fade in={visible}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '8px 12px',
          borderRadius: '4px',
          backgroundColor: 'background.paper',
          boxShadow: 2,
          position: position === 'fixed' ? 'static' : 'fixed',
          zIndex: 9999,
          ...getPositionStyles(),
        }}
      >
        <Tooltip title={getDefaultMessage()}>
          {getStatusIcon()}
        </Tooltip>
        
        {statusMessage && (
          <Typography
            variant="body2"
            sx={{ color: getTextColor() }}
          >
            {statusMessage}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

export default SyncIndicator;
