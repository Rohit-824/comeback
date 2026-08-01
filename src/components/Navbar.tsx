'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Heart, MessageSquare, LogIn } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { isLoggedIn, currentUser, user, isAdmin } = useAuth();

  const userEmail = currentUser?.email?.toLowerCase() || user?.email?.toLowerCase() || '';
  const isUserAdmin = 
    isAdmin || 
    currentUser?.is_admin === true || 
    currentUser?.role === 'admin' ||
    userEmail === 'collegeeasy.official@gmail.com' ||
    userEmail === 'dalalrohit824@gmail.com';

  const getBadgeInitials = () => {
    if (isUserAdmin) return 'AD';
    const name = currentUser?.full_name || user?.email || 'User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleProfileOrAdminClick = () => {
    if (isUserAdmin) {
      window.location.href = '/admin';
    } else {
      router.push('/profile');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#121212]/90 backdrop-blur-md border-b border-slate-800/80 font-sans">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="text-xl font-black tracking-tight text-white flex items-center gap-1">
          come<span className="text-blue-500">Back</span>
        </Link>

        {/* REQ 1: NAV LINKS */}
        <nav className="flex items-center gap-6 text-xs sm:text-sm font-bold">
          <Link 
            href="/feed?category=funding" 
            className="text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 text-amber-400" /> Donate
          </Link>
          <Link 
            href="/feed?category=discussion" 
            className="text-slate-300 hover:text-white transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" /> Discussions
          </Link>
        </nav>

        {/* ACCOUNT BADGE OR SIGN IN */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={handleProfileOrAdminClick}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition shadow-lg active:scale-95 border ${
                isUserAdmin
                  ? 'bg-purple-600 text-white border-purple-400 shadow-purple-600/30'
                  : 'bg-blue-600 text-white border-blue-400 shadow-blue-600/30'
              }`}
            >
              {getBadgeInitials()}
            </button>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}