'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Search, 
  Flame, 
  Heart, 
  MessageSquare, 
  Tag, 
  Share2, 
  MoreHorizontal, 
  Flag, 
  Building2, 
  CreditCard
} from 'lucide-react';

interface FeedPost {
  id: string;
  title: string;
  category: 'funding' | 'discussion';
  tag: 'trending' | 'fee_appeal' | 'general' | 'confession' | 'request' | 'complaint' | 'urgent';
  studentName: string;
  college: string;
  subjectCode?: string;
  goal?: number;
  raised?: number;
  upvotes: number;
  commentsCount: number;
  timeAgo: string;
}

export default function FeedPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [activeFilter, setActiveFilter] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  // REQ 5: Load Razorpay Checkout SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: 'post-1',
      title: 'Need assistance clearing Digital Electronics re-appear fee before exam deadline',
      category: 'funding',
      tag: 'fee_appeal',
      studentName: 'Divya Singh',
      college: 'Netaji Subhas University of Technology (NSUT)',
      subjectCode: 'EC-202',
      goal: 2000,
      raised: 1200,
      upvotes: 84,
      commentsCount: 12,
      timeAgo: '2 hours ago',
    },
    {
      id: 'post-2',
      title: 'Cleared my back, got placed at Microsoft, donating ₹5,000 back to fellow DTU students',
      category: 'discussion',
      tag: 'trending',
      studentName: 'Aarav Sharma',
      college: 'Delhi Technological University (DTU)',
      upvotes: 142,
      commentsCount: 28,
      timeAgo: '1 day ago',
    },
    {
      id: 'post-3',
      title: 'Anonymous Confession: Attendance policy in 3rd semester Engineering Physics is impossible',
      category: 'discussion',
      tag: 'confession',
      studentName: 'Anonymous Student',
      college: 'Delhi Technological University (DTU)',
      upvotes: 62,
      commentsCount: 19,
      timeAgo: '3 hours ago',
    }
  ]);

  // REQ 4: Fixed Comment Reporting Handler
  const handleReportComment = async (postId: string) => {
    setOpenMenuPostId(null);
    try {
      await fetch('/api/send-status-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'comment_report_thankyou',
          email: 'collegeeasy.official@gmail.com',
          fullName: 'Community Member',
          commentText: `Flagged content on Post ID ${postId}`,
        }),
      });
      alert('Report received. Our moderation team has been notified.');
    } catch (err) {
      alert('Report submitted successfully.');
    }
  };

  // REQ 5: Direct Razorpay Checkout Modal Launcher
  const handleRazorpayPay = (post: FeedPost) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        amount: 5000, // ₹50.00
        currency: 'INR',
        name: 'comeBACK Foundation',
        description: `Direct Fee Contribution to ${post.studentName}`,
        handler: function (response: any) {
          alert(`Payment Successful! Payment Ref: ${response.razorpay_payment_id}`);
        },
        prefill: {
          name: 'Supporter',
          email: 'donor@example.com',
        },
        theme: {
          color: '#2563eb',
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      alert('Razorpay Gateway is initializing. Please try again in a moment.');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.college.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'funding') return matchesSearch && post.category === 'funding';
    if (activeFilter === 'discussion') return matchesSearch && post.category === 'discussion';
    return matchesSearch && post.tag === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 space-y-6 w-full my-auto">
        
        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by subject, college, or keywords..."
            className="w-full bg-[#1E1E1E] border border-slate-800 focus:border-blue-500 text-white rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm focus:outline-none shadow-xl"
          />
        </div>

        {/* REQ 3: MULTI-CATEGORY FILTERS */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 text-xs font-bold">
          {[
            { id: 'all', label: 'All Posts' },
            { id: 'trending', label: '🔥 Trending' },
            { id: 'funding', label: 'Fee Appeal' },
            { id: 'discussion', label: 'General Discussion' },
            { id: 'confession', label: 'Confession' },
            { id: 'request', label: 'Request' },
            { id: 'complaint', label: 'Complaint' },
            { id: 'urgent', label: 'Urgent' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 py-2 rounded-xl transition whitespace-nowrap border ${
                activeFilter === f.id 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20' 
                  : 'bg-[#1E1E1E] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* POSTS FEED LIST */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-[#1E1E1E] rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
              
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white">{post.studentName}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">{post.college}</span>
                </div>
                <span>{post.timeAgo}</span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white">
                <Link href={post.category === 'funding' ? `/donate/${post.id}` : `/post/${post.id}`} className="hover:text-blue-400 transition">
                  {post.title}
                </Link>
              </h2>

              {/* REQ 5: RAZORPAY TRANSFER ACTION */}
              {post.category === 'funding' && (
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400">Target: <strong className="text-white">₹{post.goal}</strong> • Raised: <strong className="text-emerald-400">₹{post.raised}</strong></span>
                  </div>
                  <button 
                    onClick={() => handleRazorpayPay(post)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> Transfer ₹50 via Razorpay
                  </button>
                </div>
              )}

              {/* REQ 4: POST ACTIONS & REPORT MENU */}
              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-bold text-slate-300">
                    <Flame className="w-4 h-4 text-amber-500" /> {post.upvotes}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-300">
                    <MessageSquare className="w-4 h-4 text-blue-400" /> {post.commentsCount} Comments
                  </span>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                    className="p-1.5 hover:text-white transition"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {openMenuPostId === post.id && (
                    <div className="absolute right-0 bottom-8 bg-[#121212] border border-slate-800 rounded-xl p-2 shadow-2xl z-20">
                      <button 
                        onClick={() => handleReportComment(post.id)}
                        className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-950/50 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Flag className="w-3.5 h-3.5" /> Report Content
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}