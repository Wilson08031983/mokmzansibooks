import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

/**
 * Component that allows users to restore hidden UI elements
 */
const ShowHiddenElements: React.FC = () => {
  const [hasHiddenElements, setHasHiddenElements] = useState(false);

  // Check if any elements have been hidden
  useEffect(() => {
    const hideCompanyInfoCard = localStorage.getItem('hideCompanyInfoCard');
    setHasHiddenElements(hideCompanyInfoCard === 'true');
  }, []);

  const showAllHiddenElements = () => {
    // Remove all hiding preferences
    localStorage.removeItem('hideCompanyInfoCard');
    // You can add more hidden elements here in the future
    
    toast({
      title: "Hidden Elements Restored",
      description: "All hidden elements have been restored and will appear on your next page refresh."
    });
    
    // Update state
    setHasHiddenElements(false);
    
    // Force a page refresh to show elements immediately
    window.location.reload();
  };

  if (!hasHiddenElements) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Hidden UI Elements
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          You've hidden some UI elements. You can restore them all by clicking the button below.
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={showAllHiddenElements}
          className="flex items-center gap-1"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Restore Hidden Elements</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ShowHiddenElements;
