
import { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BarcodeScanner = ({ onScan, open, onOpenChange }: BarcodeScannerProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        if (open) {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasPermission(true);
            setScanning(true);
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please check permissions.",
          variant: "destructive"
        });
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setScanning(false);
    };
  }, [open, toast]);
  
  const handleScanComplete = (barcode: string) => {
    onScan(barcode);
    onOpenChange(false);
  };
  
  // In a real app, we would integrate with a barcode scanning library
  // For this demo, we'll simulate a scan with a button
  const simulateScan = () => {
    // Generate a random barcode for demonstration
    const randomBarcode = `ITEM${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    handleScanComplete(randomBarcode);
    
    toast({
      title: "Barcode Scanned",
      description: `Scanned barcode: ${randomBarcode}`,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Position the barcode within the camera view
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {hasPermission === false && (
            <div className="text-center p-4 bg-red-50 text-red-500 rounded-md">
              Camera access denied. Please check your browser permissions.
            </div>
          )}
          
          {hasPermission !== false && (
            <>
              <div className="relative w-full h-64 bg-black rounded-md overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay 
                  playsInline
                />
                <div className="absolute inset-0 border-2 border-dashed border-white/50 m-8 pointer-events-none"></div>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                {scanning ? "Scanning for barcodes..." : "Camera initializing..."}
              </p>
            </>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={simulateScan}>
            <Camera className="mr-2 h-4 w-4" />
            Simulate Scan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
