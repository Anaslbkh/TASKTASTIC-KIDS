'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

const NavBar = () => {
  const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') || 'light';
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
  }, []);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 w-full z-50 border-b-2 border-yellow-100">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/TaskTastic Kids.png" alt="TaskTastic Kids Logo" className="h-10 w-auto" />
        </div>
        {/* Hamburger Menu for Mobile */}
        <button
          className="md:hidden text-blue-900 focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {/* Menu Items */}
        <div
          className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-6`}
        >
          {user ? (
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 hover:from-yellow-300 hover:to-blue-100 text-blue-900 font-bold py-2 px-4 rounded-full shadow-md border-2 border-white/60"
            >
              {isSigningOut ? 'Logging Out...' : 'Logout'}
            </Button>
          ) : (
            <Button
              onClick={handleLogin}
              className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 hover:from-yellow-300 hover:to-blue-100 text-blue-900 font-bold py-2 px-4 rounded-full shadow-md border-2 border-white/60"
            >
              {isSigningIn ? 'Logging In...' : 'Login'}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
