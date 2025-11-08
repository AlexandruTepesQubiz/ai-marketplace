'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export default function MyProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setProfile(data.profile);
      setPhoneNumber(data.profile.phone_number || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      setError(null);

      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfile(data.profile);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPhoneNumber(profile?.phone_number || '');
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">
              View and manage your account details
            </p>
          </div>
          <Button onClick={() => router.push('/')} variant="outline" size="sm" className="text-xs sm:text-sm flex-shrink-0">
            Back
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Loading your profile...
            </div>
          </div>
        ) : error && !profile ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-3 sm:mb-4">{error}</div>
            <Button onClick={fetchProfile} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : profile ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Success Message */}
            {saveSuccess && (
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                  Profile updated successfully!
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Profile Information Card */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your account details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Full Name */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </Label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                    {profile.full_name || 'Not set'}
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </Label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">
                    {profile.email}
                  </p>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="text-sm sm:text-base h-9 sm:h-10"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {profile.phone_number || 'Not set'}
                    </p>
                  )}
                </div>

                {/* Account Created */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Member Since
                  </Label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                    {formatDate(profile.created_at)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={saving}
                        className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                    >
                      Edit Phone Number
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}
