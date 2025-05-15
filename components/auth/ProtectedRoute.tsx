'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/layout/AuthLayout';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import PageLoader from "@/components/ui/PageLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Auth state
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // Profile state
  const { profile, isLoading: profileLoading } = useUserProfile();

  // Helper: is profile complete?
  const isProfileComplete = profile && profile.displayName && profile.university && profile.photoURL;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    // If logged in and profile is loaded, check completeness
    if (!loading && user && !profileLoading && profile && !isProfileComplete) {
      // Don't redirect if already on /profile/setup
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/profile/setup')) {
        router.push('/profile/setup');
      }
    }
  }, [user, loading, mounted, router, profile, profileLoading, isProfileComplete]);

  if (!mounted || loading || profileLoading) {
    return <PageLoader text="Checking authentication..." />;
  }

  if (!user) {
    return null;
  }
  if (profile && !isProfileComplete) {
    // Prevent rendering protected content if profile incomplete
    return null;
  }

  return <>{children}</>;
}