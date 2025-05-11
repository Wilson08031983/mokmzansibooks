import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import QuoteVersionHistory from './QuoteVersionHistory';
import { Quote } from '../../utils/quotesInvoicesAdapter';

interface QuoteVersionDialogProps {
  quote: Quote;
  buttonLabel?: string;
  showIconButton?: boolean;
  onVersionRestored?: () => void;
}

const QuoteVersionDialog: React.FC<QuoteVersionDialogProps> = ({
  quote,
  buttonLabel = 'Version History',
  showIconButton = false,
  onVersionRestored = () => {}
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleVersionRestored = () => {
    // Call the callback from parent
    onVersionRestored();
    // Close the dialog
    handleClose();
  };

  return (
    <>
      {showIconButton ? (
        <Tooltip title="Version History">
          <IconButton onClick={handleOpen} size="small">
            <HistoryIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          onClick={handleOpen}
          startIcon={<HistoryIcon />}
          variant="outlined"
          color="primary"
          size="small"
        >
          {buttonLabel}
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Quote Version History
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Quote #{quote.quoteNumber}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          <QuoteVersionHistory
            quoteId={quote.id}
            currentQuote={quote}
            onVersionRestored={handleVersionRestored}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuoteVersionDialog;
