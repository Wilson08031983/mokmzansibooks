import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { TemporaryDisplay } from '@/components/ui/temporary-display';
import { Building2, Timer, Clock, ArrowDownRight } from 'lucide-react';

const TemporaryDisplayDemo = () => {
  const [showCompanyCard, setShowCompanyCard] = useState(false);
  const [position, setPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'>('bottom-right');
  const [countdown, setCountdown] = useState<number>(0);
  const [duration, setDuration] = useState<number>(5000); // 5 seconds by default
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Handle countdown timer when display is shown
  useEffect(() => {
    if (showCompanyCard) {
      // Reset countdown and record start time
      startTimeRef.current = Date.now();
      setCountdown(Math.ceil(duration / 1000));
      
      // Start countdown timer
      const intervalId = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
        setCountdown(remaining);
        
        // Stop countdown when reaches 0
        if (remaining <= 0) {
          clearInterval(intervalId);
        }
      }, 200); // Update frequently for smooth countdown
      
      return () => clearInterval(intervalId);
    }
  }, [showCompanyCard, duration]);

  const handleShowDisplay = () => {
    // Reset any previous display
    if (showCompanyCard) {
      setShowCompanyCard(false);
      
      // Use a small delay to ensure React properly manages the state transition
      setTimeout(() => {
        setShowCompanyCard(true);
      }, 50);
    } else {
      setShowCompanyCard(true);
    }
    
    console.log(`Showing card at ${new Date().toISOString()} for ${duration}ms`);
  };

  const handleCloseDisplay = () => {
    setShowCompanyCard(false);
    setCountdown(0);
    console.log(`Card closed at ${new Date().toISOString()}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Temporary Display Component Demo</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>Auto-hiding Display ({duration / 1000} seconds)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Button 
              onClick={handleShowDisplay}
              variant="default"
              className="gap-2"
            >
              <Timer className="h-4 w-4" />
              Show for {duration / 1000}s
            </Button>
            
            <div className="flex gap-2 items-center">
              <label htmlFor="duration" className="text-sm font-medium">Duration:</label>
              <select 
                id="duration"
                className="p-2 border rounded-md"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value="3000">3 seconds</option>
                <option value="5000">5 seconds</option>
                <option value="10000">10 seconds</option>
              </select>
            </div>
            
            <div className="flex gap-2 items-center">
              <label htmlFor="position" className="text-sm font-medium">Position:</label>
              <select 
                id="position"
                className="p-2 border rounded-md"
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
              >
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="center">Center</option>
              </select>
            </div>
          </div>
          
          {showCompanyCard && (
            <div className="bg-green-100 p-3 rounded-md mt-4 flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Card is showing! Auto-hiding in {countdown} seconds...
              </span>
            </div>
          )}
          
          <div className="mt-4 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              The temporary display will appear for the specified duration and then automatically hide itself.
              You can also close it manually by clicking the X button in the top-right corner.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Temporary Display Component */}
      <TemporaryDisplay 
        isVisible={showCompanyCard}
        duration={duration} 
        position={position}
        onClose={handleCloseDisplay}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Building2 className="text-primary h-6 w-6" />
            <h3 className="text-lg font-bold">Morwa Moabelo (PTY) Ltd</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex flex-col">
              <span className="text-blue-500">mokgethwamoabelo@gmail.com</span>
              <span>0645504029</span>
              <div className="text-gray-600">
                81 Monokane Street, Tshwane<br />
                Ward 107, Gauteng, 0006
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            This card will auto-hide in {countdown} seconds
          </div>
        </div>
      </TemporaryDisplay>
    </div>
  );
};

export default TemporaryDisplayDemo;
