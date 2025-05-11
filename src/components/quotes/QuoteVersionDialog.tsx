
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { History } from 'lucide-react';
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
        <Button variant="ghost" size="sm" onClick={handleOpen} title="Version History">
          <History className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={handleOpen}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          {buttonLabel}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quote Version History</DialogTitle>
            <DialogDescription>
              Quote #{quote.quoteNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* Placeholder for QuoteVersionHistory component */}
            <div className="text-center py-8">
              Version history will be displayed here.
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuoteVersionDialog;
