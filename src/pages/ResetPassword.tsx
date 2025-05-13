
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [searchParams] = useSearchParams();
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for token in URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      // In a real app, you would validate the token here
    } else {
      setIsTokenValid(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Password validation
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    const success = await resetPassword(token, newPassword);

    if (success) {
      toast({
        title: 'Password reset successful',
        description: 'Your password has been updated'
      });
      navigate('/login', { replace: true });
    } else {
      toast({
        title: 'Reset failed',
        description: error || 'An error occurred while resetting your password',
        variant: 'destructive'
      });
    }
  };

  // Show error if token is invalid or missing
  if (!isTokenValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-center text-gray-600">
              This password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password">
              <Button variant="outline">Request a new reset link</Button>
            </Link>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
