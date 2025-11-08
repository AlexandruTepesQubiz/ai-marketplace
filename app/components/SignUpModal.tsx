'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!firstName.trim()) {
        setError('Please enter your first name');
        setLoading(false);
        return;
      }
      if (!lastName.trim()) {
        setError('Please enter your last name');
        setLoading(false);
        return;
      }
      if (!phoneNumber.trim()) {
        setError('Please enter your phone number');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, firstName, lastName, phoneNumber);
      if (error) {
        setError(error.message);
      } else {
        onClose();
        resetForm();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setError('');
  };

  const handleSwitchToSignIn = () => {
    resetForm();
    onClose();
    onSwitchToSignIn();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Create Your Account</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Join our voice-first marketplace to buy and sell
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-2.5 sm:p-3">
            <p className="text-xs sm:text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                className="text-sm sm:text-base h-9 sm:h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="phoneNumber" className="text-xs sm:text-sm">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              required
              className="text-sm sm:text-base h-9 sm:h-10"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="text-sm sm:text-base h-9 sm:h-10"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Must be at least 6 characters
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-9 sm:h-10 text-sm sm:text-base">
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="text-center text-xs sm:text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            onClick={handleSwitchToSignIn}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
