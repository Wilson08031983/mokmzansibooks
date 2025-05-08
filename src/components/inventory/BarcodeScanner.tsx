
import { useState, useRef, useEffect } from 'react';
import { X, Camera, Keyboard, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
// Only import the barcode scanner library if we're going to use it
let BrowserMultiFormatReader: any;
let Result: any;
let Exception: any;

// Feature detection for camera support
const hasCameraSupport = typeof navigator !== 'undefined' && 
                       !!navigator.mediaDevices && 
                       !!navigator.mediaDevices.getUserMedia;

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
  const codeReaderRef = useRef<any>(null);
  
  // Dynamically import the barcode scanner library only if camera is supported
  useEffect(() => {
    let mounted = true;
    
    const initializeScanner = async () => {
      if (!hasCameraSupport) {
        setHasPermission(false);
        setCameraError('Camera not supported in this browser or device');
        setActiveTab('manual');
        return;
      }
      
      try {
        // Dynamically import the library only when needed
        const ZXing = await import('@zxing/library');
        BrowserMultiFormatReader = ZXing.BrowserMultiFormatReader;
        Result = ZXing.Result;
        Exception = ZXing.Exception;
        
        if (!mounted) return;
        
        // Initialize the code reader
        codeReaderRef.current = new BrowserMultiFormatReader();
        console.log("Barcode scanner initialized");
      } catch (error) {
        if (!mounted) return;
        
        console.warn("Failed to initialize barcode scanner:", error);
        setCameraError("Failed to initialize barcode scanner. Please use manual entry.");
        setHasPermission(false);
        setActiveTab('manual');
      }
    };
    
    initializeScanner();
    
    return () => {
      mounted = false;
      // Clean up when component unmounts
      try {
        if (codeReaderRef.current) {
          codeReaderRef.current.reset();
        }
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
    };
  }, []);
  
  useEffect(() => {
    let mounted = true;
    
    const startScanner = async () => {
      if (!open || !codeReaderRef.current) {
        // If dialog is open but codeReader isn't initialized, switch to manual entry
        if (open && !codeReaderRef.current) {
          setActiveTab('manual');
          setHasPermission(false);
          setCameraError('Camera initialization failed. Please use manual entry.');
        }
        return;
      }
      
      try {
        setScanning(true);
        setCameraError(null);
        
        // Check for camera support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported in this browser');
        }
        
        // Get available video devices
        let videoInputDevices = [];
        try {
          videoInputDevices = await codeReaderRef.current.listVideoInputDevices();
        } catch (deviceError) {
          console.warn("Error listing video devices:", deviceError);
          throw new Error('Unable to access camera devices');
        }
        
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
        try {
          await codeReaderRef.current.decodeFromVideoDevice(
            device.deviceId,
            videoRef.current as HTMLVideoElement,
            (result: any | null, error: any | undefined) => {
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
                  console.warn("Scanning error (non-critical):", error);
                }
              }
            }
          );
          
          setHasPermission(true);
        } catch (streamError) {
          console.warn("Error starting video stream:", streamError);
          throw new Error('Unable to start camera stream');
        }
      } catch (err) {
        // More user-friendly error handling
        console.warn("Camera initialization error:", err);
        setHasPermission(false);
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown camera error';
        setCameraError(errorMessage);
        
        // Automatically switch to manual entry on camera error
        setActiveTab('manual');
        
        toast({
          title: "Camera Not Available",
          description: "Using manual barcode entry instead",
          variant: "default"
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
  
  const [manualBarcode, setManualBarcode] = useState('');
  const [activeTab, setActiveTab] = useState(hasCameraSupport ? 'camera' : 'manual');
  
  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid barcode",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Scan or Enter Barcode</DialogTitle>
          <DialogDescription>
            Scan a barcode with your camera or enter it manually
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Keyboard className="mr-2 h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="flex flex-col items-center space-y-4">
            {!hasCameraSupport && (
              <div className="text-center p-6 bg-amber-50 rounded-md w-full">
                <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="font-medium text-amber-800">Camera Not Available</p>
                <p className="mt-2 text-sm text-amber-700">
                  Your browser or device doesn't support camera access.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setActiveTab('manual')}
                >
                  Switch to Manual Entry
                </Button>
              </div>
            )}
            
            {hasCameraSupport && hasPermission === false && (
              <div className="text-center p-4 bg-red-50 text-red-500 rounded-md w-full">
                <p className="font-medium">Camera access denied</p>
                <p className="mt-2 text-sm">{cameraError}</p>
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={() => setActiveTab('manual')}
                >
                  Switch to Manual Entry
                </Button>
              </div>
            )}
            
            {hasCameraSupport && hasPermission !== false && (
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
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground">
                Enter the barcode number manually:
              </p>
              <div className="flex space-x-2">
                <Input
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Enter barcode number"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSubmit();
                    }
                  }}
                />
                <Button onClick={handleManualSubmit}>
                  Submit
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
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
