'use client';

import type { User } from 'firebase/auth';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newFirebaseUser) => {
      setUser(newFirebaseUser);
      setLoading(false); // Auth state now known

      // Navigation logic
      if (newFirebaseUser) {
        // User is logged in
        // If they are on the home/login page (assumed to be '/'), redirect to the app's main page.
        if (pathname === '/') {
          router.push('/make-your-day');
        }
      } else {
        // User is logged out
        // If they are on a protected page (e.g., '/make-your-day'), redirect to home/login.
        if (pathname === '/make-your-day') {
          router.push('/');
        }
      }
    });
    return () => unsubscribe();
  }, [router, pathname]); // Dependencies ensure this runs if router or pathname changes

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user and appropriate redirection.
    } catch (error) {
      console.error("Error signing in with Google", error);
      // Optionally, show a toast message to the user
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null); // Explicitly set user to null
      // onAuthStateChanged will handle redirecting to '/' because user is now null and pathname might be '/make-your-day'.
    } catch (error) {
      console.error("Error signing out", error);
      // Optionally, show a toast message to the user
    } finally {
      setLoading(false);
    }
  };

  // This loading state is for the initial auth check or when navigating to a protected route.
  if (loading && pathname === '/make-your-day') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 via-rose-50 to-yellow-50">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
        <p className="text-xl text-gray-700 font-semibold">Loading your magical adventure...</p>
        <p className="text-sm text-gray-500">Please wait a moment.</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
