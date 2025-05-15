'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/footer';
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Create Auth Context
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

// Create AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Create useAuthContext hook
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = ['/login', '/signup', '/reset-password'].includes(pathname);

  return (
    <AuthProvider>
      <main className={`${isAuthPage ? 'pt-0' : 'pt-0'} pb-16 px-4`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </AuthProvider>
  );
} 