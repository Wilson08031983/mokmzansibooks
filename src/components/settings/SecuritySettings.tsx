import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Lock, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const SecuritySettings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('weak');

  const handleChangePassword = async () => {
    try {
      // Implement password change logic
      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully changed.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Password Change Failed',
        description: 'Unable to change password. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleTwoFactor = async () => {
    try {
      // Implement two-factor authentication toggle
      setTwoFactorEnabled(!twoFactorEnabled);
      toast({
        title: `Two-Factor Authentication ${twoFactorEnabled ? 'Disabled' : 'Enabled'}`,
        description: `Two-factor authentication has been ${twoFactorEnabled ? 'disabled' : 'enabled'}.`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Two-Factor Authentication Error',
        description: 'Unable to change two-factor authentication settings.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" /> Security Settings
        </CardTitle>
        <CardDescription>
          Manage your account security and access settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Change Password</Label>
          <div className="flex items-center gap-2">
            <Input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="New Password" 
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Password Strength: 
            <span 
              className={`ml-2 font-semibold ${
                passwordStrength === 'weak' ? 'text-red-500' :
                passwordStrength === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`}
            >
              {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
            </span>
          </div>
          <Button onClick={handleChangePassword} className="w-full">
            <Key className="mr-2 w-4 h-4" /> Update Password
          </Button>
        </div>

        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Two-Factor Authentication
          </Label>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
            <Switch 
              checked={twoFactorEnabled}
              onCheckedChange={toggleTwoFactor}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
