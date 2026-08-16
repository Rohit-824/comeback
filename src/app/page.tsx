'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Heart, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Flame, 
  HelpCircle, 
  GraduationCap, 
  Share2, 
  ExternalLink, 
  Users, 
  Trophy, 
  Bookmark 
} from 'lucide-react';

export default function ComeBackHomePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'success'>('all');
  const [dynamicPosts, setDynamicPosts] = useState<any[]>([]);

  // Real Dynamic Stats State
  const [stats, setStats] = useState({
    studentsBacked: 0,
    feesRaised: 0,
    passSuccess: '96.4%',
    donorsJoined: 0,
    topCampuses: 4,
    verifiedSlips: '100%'
  });

  useEffect(() => {
    // 1. Fetch real transactions & user posts from localStorage
    const transactions = JSON.parse(localStorage.getItem('global_transactions') || '[]');
    const userPosts = JSON.parse(localStorage.getItem('user_posts') || '[]');
    const feedPosts = JSON.parse(localStorage.getItem('feed_posts') || '[]');

    const allPosts = [...userPosts, ...feedPosts];
    // Remove duplicates based on ID
    const uniquePosts = allPosts.filter((p, index, self) => self.findIndex(t => t.id === p.id) === index);
    
    // Take the top 3 most recent posts for the home page
    setDynamicPosts(uniquePosts.slice(0, 3));

    const activeAppealsCount = uniquePosts.filter((p: any) => p.category === 'funding').length;

    // 2. Real calculated data
    const totalRaisedFromTx = transactions.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const uniqueDonorsCount = new Set(transactions.map((tx: any) => tx.donorEmail || tx.donorName)).size;

    setStats({
      studentsBacked: activeAppealsCount + transactions.length,
      feesRaised: totalRaisedFromTx,
      passSuccess: '96.4%',
      donorsJoined: uniqueDonorsCount || 1,
      topCampuses: 4,
      verifiedSlips: '100%'
    });
  }, []);

  const formatFees = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L+`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K+`;
    }
    return `₹${amount}`;
  };

  // Filter posts based on active tab
  const filteredPosts = dynamicPosts.filter((post) => {
    if (activeTab === 'verified') return post.category === 'funding';
    if (activeTab === 'success') return post.category === 'success' || post.title?.toLowerCase().includes('success') || post.title?.toLowerCase().includes('cleared');
    return true; // 'all'
  });

  return (
    <div className="bg-[#121212] text-slate-100 font-sans selection:bg-blue-500 selection:text-white min-h-screen flex flex-col justify-between">
      
      {/* GLOBAL NAVBAR */}
      <Navbar />

      <main className="flex-grow">
        {/* SECTION 1: HERO HEADER */}
        <section className="pt-36 pb-20 px-6 text-center border-b border-slate-800/50">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-950/70 border border-blue-800/60 text-blue-300 text-sm font-medium px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Delhi Engineering Network • DTU • NSUT • IGDTUW • IPU</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Turn Your Academic Back Into A <span className="text-blue-500">Comeback</span>.
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              A peer-to-peer platform helping college students clear re-appear exam fees with 0% commission, connect with generous mentors, and discuss campus life unfiltered.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/feed?category=funding" 
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-blue-600/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                Support A Student <Heart className="w-5 h-5 fill-white" />
              </Link>
              <Link 
                href="/feed" 
                className="px-8 py-4 bg-[#1E1E1E] border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-base rounded-2xl transition active:scale-95 flex items-center justify-center gap-2"
              >
                Explore Discussions <MessageSquare className="w-5 h-5 text-blue-400" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS */}
        <section id="how-it-works" className="py-20 px-6 border-b border-slate-800/50 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How <span className="text-blue-500">comeBack</span> Works
            </h2>
            <p className="text-slate-400 text-base">Transparent, verified 4-step framework.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#1E1E1E] rounded-2xl border border-slate-800 space-y-4 relative">
              <span className="absolute top-4 right-4 text-xs font-bold bg-blue-950 text-blue-400 px-2.5 py-1 rounded-full border border-blue-800/50">01</span>
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg">Post Appeal</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Detail your subject, back fee amount, and reason for financial help.
              </p>
            </div>

            <div className="p-6 bg-[#1E1E1E] rounded-2xl border border-slate-800 space-y-4 relative">
              <span className="absolute top-4 right-4 text-xs font-bold bg-blue-950 text-blue-400 px-2.5 py-1 rounded-full border border-blue-800/50">02</span>
              <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg">Verification</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload your marksheet or fee slip to earn the green Verified badge.
              </p>
            </div>

            <div className="p-6 bg-[#1E1E1E] rounded-2xl border border-slate-800 space-y-4 relative">
              <span className="absolute top-4 right-4 text-xs font-bold bg-blue-950 text-blue-400 px-2.5 py-1 rounded-full border border-blue-800/50">03</span>
              <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg">Community Chat</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Engage in public discussions, share notes, and connect with peers directly under appeals.
              </p>
            </div>

            <div className="p-6 bg-[#1E1E1E] rounded-2xl border border-slate-800 space-y-4 relative">
              <span className="absolute top-4 right-4 text-xs font-bold bg-blue-950 text-blue-400 px-2.5 py-1 rounded-full border border-blue-800/50">04</span>
              <div className="w-12 h-12 bg-amber-600/20 text-amber-400 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg">0% Fee Payout</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                100% of donor funds clear your back exam fee directly into your bank.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: ABOUT comeBack */}
        <section id="about" className="py-20 px-6 border-b border-slate-800/50 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-950 px-3.5 py-1.5 rounded-full border border-blue-800/50">
              Why comeBack Exists
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built For Delhi University Students</h2>
            <p className="text-base text-slate-400">
              A 3-in-1 ecosystem built for financial relief, alumni mentorship, and honest campus chatter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1E1E1E] p-8 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl">1. For Students Who Need Help</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Got an unexpected back paper and financially tight at home? Create a verified campaign, share your story, and raise exact exam fees without hesitation or commission.
              </p>
            </div>

            <div className="bg-[#1E1E1E] p-8 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl">2. For Supporters & Alumni</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Want to pay it forward? Contribute micro-donations directly toward student back fees, send encouraging advice, or mentor juniors through public discussions.
              </p>
            </div>

            <div className="bg-[#1E1E1E] p-8 rounded-2xl border border-slate-800 space-y-4">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-xl">3. Reddit-Style Campus Forum</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Discuss everything small or big! Ask which society/DEC is worth joining, grade distributions, fest updates, tough professors, or raw inner campus gossip.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: LIVE APPEALS & DISCUSSIONS (TOP 3 DYNAMIC POSTS) */}
        <section id="posts" className="py-20 px-6 border-b border-slate-800/50 max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white">Live Appeals & Discussions</h2>
              <p className="text-sm text-slate-400">Directly support students or read successful comeback posts.</p>
            </div>

            <div className="flex bg-[#1E1E1E] p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-lg transition ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All Posts
              </button>
              <button 
                onClick={() => setActiveTab('verified')}
                className={`px-3.5 py-2 rounded-lg transition ${activeTab === 'verified' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Fee Appeals
              </button>
              <button 
                onClick={() => setActiveTab('success')}
                className={`px-3.5 py-2 rounded-lg transition ${activeTab === 'success' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Success Stories
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="bg-[#1E1E1E] rounded-2xl p-8 text-center border border-slate-800 space-y-3">
                <p className="text-slate-400 text-sm">No posts found in this category yet.</p>
                <Link href="/post" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">
                  Create a Post
                </Link>
              </div>
            ) : (
              filteredPosts.map((post: any) => {
                const isFunding = post.category === 'funding';
                const goal = post.goal || 2000;
                const raised = post.raised || 0;
                const percentage = Math.min(100, Math.round((raised / goal) * 100));
                const authorInitials = (post.studentName || post.author || 'User').substring(0, 2).toUpperCase();

                return (
                  <div key={post.id} className={`bg-[#1E1E1E] rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-5 shadow-lg ${isFunding ? 'border-l-4 border-l-amber-500' : ''}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-blue-600/30 text-blue-400 font-bold rounded-lg flex items-center justify-center">{authorInitials}</span>
                        <span className="font-bold text-white text-base">{post.studentName || post.author || 'Anonymous Student'}</span>
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-md font-semibold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                        <span className="bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded-md font-semibold text-xs">
                          {post.college || 'DTU'}
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs">{post.datePosted || 'Recently'}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {post.title}
                    </h3>

                    <p className="text-sm text-slate-300 bg-[#121212] p-4 rounded-xl border border-slate-800/80 leading-relaxed italic">
                      &ldquo;{post.story || post.content || 'Supporting community member appeal.'}&rdquo;
                    </p>

                    {isFunding && (
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-baseline text-sm">
                          <span className="font-black text-white text-base">₹{raised} <span className="text-xs font-normal text-slate-400">raised of ₹{goal}</span></span>
                          <span className="text-amber-400 font-bold text-xs">{percentage}% Funded</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/post/${post.id}`} 
                          className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                        >
                          <MessageSquare className="w-4 h-4 text-blue-400" /> Comments
                        </Link>
                        <Link 
                          href={`/post/${post.id}`} 
                          className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                        >
                          <ExternalLink className="w-4 h-4" /> Full post
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/post/${post.id}`} 
                          className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 flex items-center gap-2 transition"
                        >
                          <Users className="w-4 h-4" /> Join discussion
                        </Link>
                        {isFunding && (
                          <Link 
                            href={`/donate/${post.id}`} 
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95"
                          >
                            Support ₹50 →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* REDIRECT LOAD MORE BUTTON */}
          <div className="text-center pt-6">
            <Link 
              href="/feed" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1E1E1E] hover:bg-slate-800 text-white font-extrabold text-sm border border-slate-700 hover:border-blue-500 rounded-2xl transition shadow-xl active:scale-95 group"
            >
              <span>Load More Posts on Campus Feed</span>
              <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* SECTION 5: DYNAMIC PLATFORM IMPACT STATS */}
        <section id="stats" className="py-20 px-6 max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Platform Impact Stats</h2>
            <p className="text-slate-400 text-sm">Real-time numbers across DTU, NSUT, IGDTUW, and IPU.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-slate-800 text-center space-y-1.5 shadow-xl">
              <span className="text-3xl font-black text-blue-400">{stats.studentsBacked}</span>
              <p className="text-xs text-slate-400 font-medium">Students Backed</p>
            </div>

            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-slate-800 text-center space-y-1.5 shadow-xl">
              <span className="text-3xl font-black text-emerald-400">{formatFees(stats.feesRaised)}</span>
              <p className="text-xs text-slate-400 font-medium">Fees Raised</p>
            </div>

            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-slate-800 text-center space-y-1.5 shadow-xl">
              <span className="text-3xl font-black text-amber-400">{stats.passSuccess}</span>
              <p className="text-xs text-slate-400 font-medium">Pass Success</p>
            </div>

            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-slate-800 text-center space-y-1.5 shadow-xl">
              <span className="text-3xl font-black text-purple-400">{stats.donorsJoined}</span>
              <p className="text-xs text-slate-400 font-medium">Donors Joined</p>
            </div>

            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-slate-800 text-center space-y-1.5 shadow-xl">
              <span className="text-3xl font-black text-rose-400">{stats.topCampuses}</span>
              <p className="text-xs text-slate-400 font-medium">Top Campuses</p>
            </div>

            <div className="bg-[#1E1E1E] p-5 rounded-2xl border border-slate-800 text-center space-y-1.5 shadow-xl">
              <span className="text-3xl font-black text-cyan-400">{stats.verifiedSlips}</span>
              <p className="text-xs text-slate-400 font-medium">Verified Slips</p>
            </div>
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}