import React, { useState } from 'react';
import { sendEmail, sendPasswordResetEmail, sendWelcomeEmail } from '@/services/emailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const EmailTest: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // General email form state
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: '',
    name: ''
  });
  
  // Password reset email form state
  const [resetForm, setResetForm] = useState({
    email: '',
    name: '',
    resetToken: ''
  });
  
  // Welcome email form state
  const [welcomeForm, setWelcomeForm] = useState({
    email: '',
    name: ''
  });
  
  const handleEmailFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleResetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleWelcomeFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWelcomeForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSendEmail = async () => {
    try {
      setLoading(true);
      await sendEmail(
        emailForm.to,
        emailForm.subject,
        emailForm.message,
        emailForm.name
      );
      
      toast({
        title: 'Email Sent',
        description: `Email has been sent to ${emailForm.to}`,
        variant: 'default'
      });
      
      // Clear form
      setEmailForm({
        to: '',
        subject: '',
        message: '',
        name: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendPasswordReset = async () => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(
        resetForm.email,
        resetForm.name,
        resetForm.resetToken
      );
      
      toast({
        title: 'Password Reset Email Sent',
        description: `Password reset instructions have been sent to ${resetForm.email}`,
        variant: 'default'
      });
      
      // Clear form
      setResetForm({
        email: '',
        name: '',
        resetToken: ''
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendWelcome = async () => {
    try {
      setLoading(true);
      await sendWelcomeEmail(
        welcomeForm.email,
        welcomeForm.name
      );
      
      toast({
        title: 'Welcome Email Sent',
        description: `Welcome email has been sent to ${welcomeForm.email}`,
        variant: 'default'
      });
      
      // Clear form
      setWelcomeForm({
        email: '',
        name: ''
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send welcome email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Email Testing Tool</h1>
      <p className="text-muted-foreground mb-8">
        Use this page to test sending different types of emails to users.
        In development mode, emails are logged to the console instead of being sent.
      </p>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Email</TabsTrigger>
          <TabsTrigger value="password-reset">Password Reset</TabsTrigger>
          <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Send Custom Email</CardTitle>
              <CardDescription>
                Send a custom email to any recipient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="to">Recipient Email</Label>
                  <Input 
                    id="to" 
                    name="to" 
                    value={emailForm.to} 
                    onChange={handleEmailFormChange} 
                    placeholder="recipient@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Recipient Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={emailForm.name} 
                    onChange={handleEmailFormChange} 
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input 
                  id="subject" 
                  name="subject" 
                  value={emailForm.subject} 
                  onChange={handleEmailFormChange} 
                  placeholder="Email Subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  value={emailForm.message} 
                  onChange={handleEmailFormChange} 
                  placeholder="Email message content..."
                  rows={6}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSendEmail} 
                disabled={loading || !emailForm.to || !emailForm.subject || !emailForm.message}
              >
                {loading ? 'Sending...' : 'Send Email'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="password-reset">
          <Card>
            <CardHeader>
              <CardTitle>Send Password Reset Email</CardTitle>
              <CardDescription>
                Test sending a password reset email to a user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">User Email</Label>
                  <Input 
                    id="reset-email" 
                    name="email" 
                    value={resetForm.email} 
                    onChange={handleResetFormChange} 
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-name">User Name</Label>
                  <Input 
                    id="reset-name" 
                    name="name" 
                    value={resetForm.name} 
                    onChange={handleResetFormChange} 
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-token">Reset Token or Temporary Password</Label>
                <Input 
                  id="reset-token" 
                  name="resetToken" 
                  value={resetForm.resetToken} 
                  onChange={handleResetFormChange} 
                  placeholder="abc123"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSendPasswordReset} 
                disabled={loading || !resetForm.email || !resetForm.name || !resetForm.resetToken}
              >
                {loading ? 'Sending...' : 'Send Password Reset Email'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="welcome">
          <Card>
            <CardHeader>
              <CardTitle>Send Welcome Email</CardTitle>
              <CardDescription>
                Test sending a welcome email to a new user
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome-email">User Email</Label>
                  <Input 
                    id="welcome-email" 
                    name="email" 
                    value={welcomeForm.email} 
                    onChange={handleWelcomeFormChange} 
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcome-name">User Name</Label>
                  <Input 
                    id="welcome-name" 
                    name="name" 
                    value={welcomeForm.name} 
                    onChange={handleWelcomeFormChange} 
                    placeholder="John Doe"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSendWelcome} 
                disabled={loading || !welcomeForm.email || !welcomeForm.name}
              >
                {loading ? 'Sending...' : 'Send Welcome Email'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-medium mb-2">Development Mode Notice</h3>
        <p className="text-sm text-muted-foreground">
          In development mode, emails are not actually sent but are logged to the console.
          To send real emails, you need to:
        </p>
        <ol className="text-sm text-muted-foreground list-decimal list-inside mt-2 space-y-1">
          <li>Sign up for an EmailJS account at <a href="https://www.emailjs.com/" className="text-primary underline">emailjs.com</a></li>
          <li>Create an email service and template</li>
          <li>Update the configuration in <code className="bg-background px-1 py-0.5 rounded">src/services/emailService.ts</code></li>
        </ol>
      </div>
    </div>
  );
};

export default EmailTest;
