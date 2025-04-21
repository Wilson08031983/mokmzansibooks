
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BrowserMultiFormatReader, Result, Exception } from '@zxing/library';

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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  
  useEffect(() => {
    // Initialize the code reader with console debugging enabled
    codeReaderRef.current = new BrowserMultiFormatReader();
    // Enable logging for debugging purposes
    console.log("Barcode scanner initialized");
    
    return () => {
      // Clean up when component unmounts
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);
  
  useEffect(() => {
    let mounted = true;
    
    const startScanner = async () => {
      if (!open || !codeReaderRef.current) return;
      
      try {
        setScanning(true);
        setCameraError(null);
        
        // Check for camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported in this browser');
        }
        
        // Get available video devices
        const videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          throw new Error('No camera devices found');
        }
        
        // Use the environment-facing camera if available (usually back camera on mobile devices)
        const device = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        ) || videoInputDevices[0];
        
        console.log('Selected camera device:', device);
        
        // Start continuous scanning with selected device
        await codeReaderRef.current.decodeFromVideoDevice(
          device.deviceId,
          videoRef.current as HTMLVideoElement,
          (result: Result | null, error: Exception | undefined) => {
            if (!mounted) return;
            
            if (result) {
              const scannedCode = result.getText();
              if (scannedCode) {
                // Handle successful scan
                console.log('Scanned barcode:', scannedCode);
                onScan(scannedCode);
                
                toast({
                  title: "Barcode Scanned",
                  description: `Successfully scanned: ${scannedCode}`,
                  variant: "success"
                });
                
                onOpenChange(false);
              }
            }
            
            if (error) {
              // Only log non-typical scanning errors
              if (!(error instanceof Exception)) {
                console.error("Scanning error:", error);
              }
            }
          }
        );
        
        setHasPermission(true);
      } catch (err) {
        console.error("Camera initialization error:", err);
        setHasPermission(false);
        setCameraError(err instanceof Error ? err.message : 'Unknown camera error');
        
        toast({
          title: "Camera Error",
          description: `Unable to access camera: ${cameraError || 'Unknown error'}`,
          variant: "destructive"
        });
      }
    };
    
    if (open) {
      startScanner();
    } else {
      // Stop scanning when dialog is closed
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      setScanning(false);
    }
    
    return () => {
      mounted = false;
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [open, toast, onScan, onOpenChange, cameraError]);
  
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
              Camera access denied. Please check browser permissions:
              <p className="mt-2 text-sm">{cameraError}</p>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
