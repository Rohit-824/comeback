'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isLoggedIn, currentUser, user } = useAuth();

  const getInitials = () => {
    const name = currentUser?.full_name || user?.email || 'User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#121212]/90 backdrop-blur-md border-b border-slate-800/80 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1 text-xl font-black text-white tracking-tight">
          come<span className="text-blue-500">Back</span>
        </Link>

        {/* CENTER LINKS */}
        <div className="flex items-center gap-6 text-xs sm:text-sm font-bold">
          {/* DONATE -> Feed page with Fee Appeal filter */}
          <Link 
            href="/feed?category=funding" 
            className="flex items-center gap-1.5 text-slate-300 hover:text-amber-400 transition"
          >
            <Heart className="w-4 h-4 text-amber-400 fill-amber-400/20" /> Donate
          </Link>

          {/* DISCUSSIONS -> Feed page with All Posts filter */}
          <Link 
            href="/feed?category=all" 
            className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" /> Discussions
          </Link>
        </div>

        {/* PROFILE / AUTH BUTTON */}
        <div>
          {isLoggedIn ? (
            <Link 
              href="/profile" 
              className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center justify-center transition shadow-md shadow-blue-600/20 border border-blue-400/30"
              title="Go to Profile"
            >
              {getInitials()}
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" /> Sign In
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}