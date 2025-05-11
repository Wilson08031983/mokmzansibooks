import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { CreditCard, Trash2, Lock, Eye, EyeOff } from 'lucide-react';

// Define the SavedCard interface
interface SavedCard {
  id: string;
  last4: string;
  expMonth: string;
  expYear: string;
  brand: string;
  isDefault: boolean;
}

// Mock function to get saved cards from local storage
const getSavedCards = (userId: string): SavedCard[] => {
  const savedCardsJson = localStorage.getItem(`savedCards_${userId}`);
  if (savedCardsJson) {
    return JSON.parse(savedCardsJson);
  }
  return [];
};

// Mock function to save cards to local storage
const saveCards = (userId: string, cards: SavedCard[]): void => {
  localStorage.setItem(`savedCards_${userId}`, JSON.stringify(cards));
};

const SavedCardsManager = () => {
  const { currentUser } = useSupabaseAuth();
  const { toast } = useToast();
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Load saved cards on component mount
  useEffect(() => {
    if (currentUser?.email) {
      // Use email as unique identifier instead of uid
      const cards = getSavedCards(currentUser.email);
      setSavedCards(cards);
    }
  }, [currentUser]);

  // Handle password verification
  const verifyPassword = () => {
    // In a real app, this would call an API to verify the password
    // For demo purposes, we'll just check if the password is not empty
    if (password.length > 0) {
      setIsAuthenticated(true);
      setIsPasswordDialogOpen(false);
      toast({
        title: 'Authentication successful',
        description: 'You can now view and manage your saved cards.',
      });
    } else {
      toast({
        title: 'Authentication failed',
        description: 'Please enter a valid password.',
        variant: 'destructive',
      });
    }
  };

  // Handle card deletion
  const deleteCard = (cardId: string) => {
    if (!isAuthenticated) {
      setIsPasswordDialogOpen(true);
      return;
    }

    const updatedCards = savedCards.filter(card => card.id !== cardId);
    setSavedCards(updatedCards);
    
    if (currentUser?.email) {
      saveCards(currentUser.email, updatedCards);
    }
    
    toast({
      title: 'Card removed',
      description: 'Your card has been removed successfully.',
    });
  };

  // Handle setting a card as default
  const setDefaultCard = (cardId: string) => {
    if (!isAuthenticated) {
      setIsPasswordDialogOpen(true);
      return;
    }

    const updatedCards = savedCards.map(card => ({
      ...card,
      isDefault: card.id === cardId,
    }));
    
    setSavedCards(updatedCards);
    
    if (currentUser?.email) {
      saveCards(currentUser.email, updatedCards);
    }
    
    toast({
      title: 'Default card updated',
      description: 'Your default payment method has been updated.',
    });
  };

  // Get card brand icon/name
  const getCardBrandDisplay = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      default:
        return brand;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Saved Payment Methods</h3>
      
      {!isAuthenticated ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Lock className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Your payment methods are protected</h3>
              <p className="text-sm text-gray-500 mb-4">
                Please verify your identity to view and manage your saved payment methods.
              </p>
              <Button onClick={() => setIsPasswordDialogOpen(true)}>
                Verify Identity
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {savedCards.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved cards</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You haven't saved any payment methods yet. Your cards will appear here when you save them during checkout.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedCards.map((card) => (
                <Card key={card.id} className={card.isDefault ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">
                        {getCardBrandDisplay(card.brand)}
                      </CardTitle>
                      {card.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      •••• •••• •••• {card.last4}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-500">
                      Expires: {card.expMonth}/{card.expYear}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {!card.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDefaultCard(card.id)}
                      >
                        Set as default
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => deleteCard(card.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {savedCards.length >= 4 && (
                <div className="text-sm text-amber-600 mt-2">
                  You've reached the maximum limit of 4 saved cards.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Password verification dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Identity</DialogTitle>
            <DialogDescription>
              Please enter your password to view and manage your saved payment methods.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {isPasswordVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={verifyPassword}>
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedCardsManager;
