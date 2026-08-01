'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  MessageSquare, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  PlusCircle, 
  Search,
  CheckCircle2,
  ExternalLink,
  Users,
  Bookmark
} from 'lucide-react';

export default function FeedPage() {
  const { requireAuthAction } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});

  const handleInteractiveAction = (actionName: string) => {
    requireAuthAction(() => {
      alert(`Action '${actionName}' performed successfully!`);
    });
  };

  const toggleSavePost = (postId: string) => {
    requireAuthAction(() => {
      setSavedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* FEED HEADER */}
        <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Delhi Engineering Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Campus Feed & Discussions
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              DTU • NSUT • IGDTUW • IPU unfiltered discussions and verified fee appeals.
            </p>
          </div>

          <button 
            onClick={() => handleInteractiveAction('Create New Post')}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Create New Post
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts by subject, college, or keywords..."
              className="w-full bg-[#1E1E1E] border border-slate-800 focus:border-blue-500 text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
            {['all', 'fee-appeal', 'general-discussion'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3.5 py-3 rounded-xl border transition whitespace-nowrap capitalize ${
                  selectedTag === tag 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-[#1E1E1E] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tag.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* POSTS FEED CONTAINER */}
        <div className="space-y-6">

          {/* 1. FEE APPEAL CARD TYPE */}
          {(selectedTag === 'all' || selectedTag === 'fee-appeal') && (
            <div className="bg-[#1E1E1E] rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-amber-600/30 text-amber-400 font-bold rounded-lg flex items-center justify-center">DS</span>
                  <span className="font-bold text-white text-base">Divya Singh</span>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-md font-semibold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                  <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded-md font-semibold text-xs">
                    NSUT
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-2.5 py-0.5 rounded-md text-xs">
                    ₹50 left!
                  </span>
                  <span className="text-slate-400 text-xs">1 day ago</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white">
                Just ₹50 away from my goal — anxiety disorder during exams, exam in 3 days
              </h3>

              <p className="text-sm text-slate-300 italic bg-[#121212] p-4 rounded-xl border border-slate-800/80 leading-relaxed">
                "Thank you to the 61 people who already donated. I have medically documented anxiety disorder. Just one small push and I can sit for my back paper."
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-black text-white text-base">₹1,950 <span className="text-xs font-normal text-slate-400">raised of ₹2,000</span></span>
                  <span className="text-amber-400 font-bold text-xs">97.5% Funded</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[97.5%]" />
                </div>
                <div className="flex justify-between text-xs text-slate-400 pt-0.5">
                  <span>61 donors</span>
                  <span>3 days left</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Link 
                    href="/post/post-1" 
                    className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                  >
                    <MessageSquare className="w-4 h-4" /> 44 comments
                  </Link>
                  <Link 
                    href="/post/post-1" 
                    className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                  >
                    <ExternalLink className="w-4 h-4" /> Full post
                  </Link>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '/post/post-1');
                      alert('Post link copied to clipboard!');
                    }}
                    className="p-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link 
                    href="/post/post-1" 
                    className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                  >
                    <Users className="w-4 h-4" /> Join discussion
                  </Link>
                  <Link 
                    href="/donate/post-1" 
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95"
                  >
                    Donate ₹50 →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 2. GENERAL DISCUSSION CARD TYPE */}
          {(selectedTag === 'all' || selectedTag === 'general-discussion') && (
            <div className="bg-[#1E1E1E] rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600/30 text-blue-400 font-bold rounded-lg flex items-center justify-center">RD</span>
                  <span className="font-bold text-white text-base">Rohit Dalal</span>
                  <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-md font-semibold text-xs">
                    General Request
                  </span>
                  <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded-md font-semibold text-xs">
                    DTU
                  </span>
                </div>
                <span className="text-slate-400 text-xs">5 hours ago</span>
              </div>

              <h3 className="text-lg font-bold text-white">
                Which DEC subject is best for 5th Sem Engineering Physics: Quantum Optics or Condensed Matter II?
              </h3>

              <p className="text-sm text-slate-300 bg-[#121212] p-4 rounded-xl border border-slate-800/80 leading-relaxed">
                "Looking for advice from senior 4th year EP students. Need to decide which elective has better grade distribution and manageable lab requirements for the upcoming semester."
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Link 
                    href="/post/post-2" 
                    className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400" /> 267 comments
                  </Link>
                  <Link 
                    href="/post/post-2" 
                    className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                  >
                    <ExternalLink className="w-4 h-4" /> Full post
                  </Link>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '/post/post-2');
                      alert('Post link copied to clipboard!');
                    }}
                    className="p-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link 
                    href="/post/post-2" 
                    className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                  >
                    <Users className="w-4 h-4" /> Join discussion
                  </Link>
                  <button 
                    onClick={() => toggleSavePost('post-2')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                      savedPosts['post-2'] 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-[#121212] hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" /> {savedPosts['post-2'] ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}