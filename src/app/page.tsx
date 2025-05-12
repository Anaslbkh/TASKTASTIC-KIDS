'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/auth-provider';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, LogIn, LogOut, Zap, Brain, Sparkles, Gift, Moon, Sun, CheckCircle, Smile, Loader2, Star, Rocket, Wand2, Menu, X, CornerDownLeft, Mountain, Cloud, Candy, User } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Head from 'next/head';

// Add animation keyframes
const floatingAnimation = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
`;

const bounceAnimation = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const spinAnimation = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const FeatureCard = ({
  icon,
  title,
  description,
  imageSrc,
  imageAlt,
  dataAiHint,
  cardClassName,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  dataAiHint: string;
  cardClassName: string;
}) => {
  const IconComponent = icon;
  return (
    <Card className={`overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col ${cardClassName}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center mb-3">
          <IconComponent className="h-8 w-8 text-primary mr-3" />
          <CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-0">
        <div className="relative w-full h-56">
          <Image 
            src={imageSrc} 
            alt={imageAlt} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={dataAiHint}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default function LandingPage() {
  const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // router.push('/make-your-day'); // AuthProvider handles redirection
    } catch (error) {
      console.error("Login failed", error);
      // TODO: Show a toast message for login failure
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed", error);
       // TODO: Show a toast message for logout failure
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleGoToApp = () => {
    router.push('/make-your-day');
  };

  const handleStartAdventure = async () => {
    if (!user) {
      setIsSigningIn(true);
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error("Login failed", error);
        // TODO: Show a toast message for login failure
      } finally {
        setIsSigningIn(false);
      }
    }
    router.push('/make-your-day');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Theme toggle (basic example, not using full theme provider for simplicity here)
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') || 'light';
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-200 via-yellow-100 to-pink-100 relative overflow-x-hidden">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Chewy&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        body { font-family: 'Chewy', 'Fredoka One', cursive, sans-serif; }
        .font-fantasy { font-family: 'Fredoka One', 'Chewy', cursive, sans-serif; }
        .font-adventure { font-family: 'Chewy', 'Fredoka One', cursive, sans-serif; }
        .storybook-banner { background: url('/storybook-banner.svg'), linear-gradient(90deg, #ffe066 60%, #fffbe6 100%); background-repeat: no-repeat; background-size: cover; }
        .parchment-card { background: url('/parchment-bg.png'), #fffbe6; background-size: cover; border-radius: 32px; box-shadow: 0 8px 32px 0 rgba(60,40,10,0.10); border: 4px solid #e2c48d; position: relative; }
        .decor-corner { position: absolute; width: 48px; height: 48px; z-index: 2; }
        .decor-corner.tl { top: -18px; left: -18px; }
        .decor-corner.tr { top: -18px; right: -18px; transform: scaleX(-1); }
        .decor-corner.bl { bottom: -18px; left: -18px; transform: scaleY(-1); }
        .decor-corner.br { bottom: -18px; right: -18px; transform: scale(-1,-1); }
        .adventure-bg { position: absolute; z-index: 0; pointer-events: none; }
        .adventure-bg.mountains { bottom: 0; left: 0; width: 100vw; height: 220px; }
        .adventure-bg.clouds { top: 0; left: 0; width: 100vw; height: 120px; }
        .adventure-bg.mushroom { left: 32px; bottom: 120px; width: 80px; }
        .adventure-bg.candy { right: 32px; bottom: 140px; width: 60px; }
        .adventure-bg.character { left: 50%; bottom: 40px; width: 120px; transform: translateX(-50%); }
      `}</style>

      {/* Navigation Bar */}
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
            className={`${
              isMenuOpen ? 'block' : 'hidden'
            } md:flex md:items-center md:space-x-6`}
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

      {/* Adjust content to account for fixed navbar */}
      <div className="pt-16">
        {/* Adventure background decorations (Lucide icons) */}
        <div className="adventure-bg mountains">
          <Mountain className="h-24 w-24 text-gray-500" />
        </div>
        <div className="adventure-bg clouds">
          <Cloud className="h-24 w-24 text-gray-300" />
        </div>
        <div className="adventure-bg mushroom">
          <Candy className="h-16 w-16 text-pink-500" />
        </div>
        <div className="adventure-bg character">
          <User className="h-32 w-32 text-blue-500" />
        </div>
        {/* Main parchment card */}
        <div className="max-w-3xl mx-auto mt-10 mb-10 parchment-card p-8 md:p-12 relative z-10">
          {/* Decorative corners (Lucide icons) */}
          <div className="decor-corner tl">
            <CornerDownLeft className="h-12 w-12 text-yellow-700" />
          </div>
          <div className="decor-corner tr">
            <CornerDownLeft className="h-12 w-12 text-yellow-700 transform scale-x-[-1]" />
          </div>
          <div className="decor-corner bl">
            <CornerDownLeft className="h-12 w-12 text-yellow-700 transform scale-y-[-1]" />
          </div>
          <div className="decor-corner br">
            <CornerDownLeft className="h-12 w-12 text-yellow-700 transform scale-[-1,-1]" />
          </div>
          {/* Header with banner */}
          <header className="flex flex-col items-center mb-8">
            <div className="storybook-banner rounded-xl px-8 py-4 mb-4 shadow-md border-2 border-yellow-300">
              <h1 className="font-fantasy text-4xl md:text-5xl text-yellow-700 text-center drop-shadow-lg">Welcome to Your Magical Quest!</h1>
            </div>
            <p className="font-adventure text-xl text-gray-700 text-center max-w-xl mb-4">Turn your daily tasks into an epic adventure. Complete quests, earn magical rewards, and reveal your hero!</p>
            <Button className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 hover:from-yellow-300 hover:to-blue-100 text-blue-900 font-bold py-3 px-10 rounded-full shadow-lg text-2xl transition-all border-2 border-white/60 mt-2">
              Start Your Adventure
            </Button>
          </header>
          {/* Features Section with parchment cards */}
          <section id="features" className="mt-8">
            <div className="storybook-banner rounded-lg px-6 py-2 mb-8 border-2 border-yellow-200 inline-block mx-auto">
              <h2 className="font-fantasy text-3xl text-yellow-700 text-center">How It Works</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/80 rounded-2xl shadow-lg border-2 border-yellow-100 p-6 flex flex-col items-center parchment-card relative">
                <img src="/AI-Poweredquest.jpeg" className="w-24 h-24 object-cover rounded-xl mb-2" alt="AI Quest" />
                <h3 className="font-fantasy text-2xl text-yellow-700 mb-2">AI-Powered Quest Ideas</h3>
                <p className="font-adventure text-lg text-gray-700 text-center mb-2">Get magical task suggestions that make learning fun! ✨</p>
              </div>
              <div className="bg-white/80 rounded-2xl shadow-lg border-2 border-yellow-100 p-6 flex flex-col items-center parchment-card relative">
                <img src="/personalized-checklists_turn.jpeg" className="w-24 h-24 object-cover rounded-xl mb-2" alt="Checklist" />
                <h3 className="font-fantasy text-2xl text-yellow-700 mb-2">Personalized Checklists</h3>
                <p className="font-adventure text-lg text-gray-700 text-center mb-2">Turn any task into an exciting adventure with step-by-step magic! 🎯</p>
              </div>
              <div className="bg-white/80 rounded-2xl shadow-lg border-2 border-yellow-100 p-6 flex flex-col items-center parchment-card relative">
                <img src="/magical-hero-reveal.jpeg" className="w-24 h-24 object-cover rounded-xl mb-2" alt="Hero" />
                <h3 className="font-fantasy text-2xl text-yellow-700 mb-2">Magical Hero Reveal</h3>
                <p className="font-adventure text-lg text-gray-700 text-center mb-2">Complete quests to unlock your unique magical hero character! 🦸‍♂️</p>
              </div>
              <div className="bg-white/80 rounded-2xl shadow-lg border-2 border-yellow-100 p-6 flex flex-col items-center parchment-card relative">
                <img src="/track-progress.jpeg" className="w-24 h-24 object-cover rounded-xl mb-2" alt="Progress" />
                <h3 className="font-fantasy text-2xl text-yellow-700 mb-2">Track Progress</h3>
                <p className="font-adventure text-lg text-gray-700 text-center mb-2">Watch your magical powers grow as you complete quests! 📈</p>
              </div>
              <div className="bg-white/80 rounded-2xl shadow-lg border-2 border-yellow-100 p-6 flex flex-col items-center parchment-card relative">
                <img src="/fun&engaging.jpeg" className="w-24 h-24 object-cover rounded-xl mb-2" alt="Fun" />
                <h3 className="font-fantasy text-2xl text-yellow-700 mb-2">Fun & Engaging</h3>
                <p className="font-adventure text-lg text-gray-700 text-center mb-2">Make learning and responsibility exciting with magical rewards! 🎮</p>
              </div>
              <div className="bg-white/80 rounded-2xl shadow-lg border-2 border-yellow-100 p-6 flex flex-col items-center parchment-card relative">
                <img src="/daily-surprises.jpeg" className="w-24 h-24 object-cover rounded-xl mb-2" alt="Surprises" />
                <h3 className="font-fantasy text-2xl text-yellow-700 mb-2">Daily Surprises</h3>
                <p className="font-adventure text-lg text-gray-700 text-center mb-2">Discover new magical heroes and powers every day! 🎁</p>
              </div>
            </div>
          </section>
          {/* Call to Action Section with banner */}
          <section className="mt-12">
            <div className="storybook-banner rounded-lg px-6 py-2 mb-6 border-2 border-yellow-200 inline-block mx-auto">
              <h2 className="font-fantasy text-3xl text-yellow-700 text-center">Ready to Begin Your Magical Journey?</h2>
            </div>
            <p className="font-adventure text-xl text-gray-700 text-center max-w-xl mx-auto mb-6">Join TaskTastic Kids today and transform everyday tasks into exciting adventures!</p>
            <Button 
              onClick={handleStartAdventure}
              className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 hover:from-yellow-300 hover:to-blue-100 text-blue-900 font-bold py-3 px-10 rounded-full shadow-lg text-2xl transition-all border-2 border-white/60"
            >
              Let's Play!
            </Button>
          </section>
        </div>
      </div>
      {/* Footer */}
      <footer className="py-8 bg-white/80 backdrop-blur-md border-t-4 border-yellow-100 rounded-t-3xl mt-8 shadow-lg">
        <div className="container mx-auto text-center">
          <p className="text-blue-900 font-fantasy">&copy; {new Date().getFullYear()} TaskTastic Kids. All rights reserved.</p>
          <p className="text-sm text-yellow-600 font-adventure">Making everyday tasks magical! ✨</p>
        </div>
      </footer>
    </div>
  );
}

