import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface PasscodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (passcode: string) => Promise<boolean>;
  title?: string;
  description?: string;
}

const PasscodeDialog: React.FC<PasscodeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Enter Passcode",
  description = "Please enter your passcode to confirm this action.",
}) => {
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!passcode.trim()) {
      setError('Passcode is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await onConfirm(passcode);
      if (success) {
        setPasscode('');
        onClose();
      } else {
        setError('Invalid passcode. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Passcode confirmation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPasscode('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              type="password"
              placeholder="Enter your passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasscodeDialog;
