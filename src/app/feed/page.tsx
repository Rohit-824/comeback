'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  MessageSquare, 
  Share2, 
  Sparkles, 
  PlusCircle, 
  Search,
  ExternalLink,
  Users,
  Bookmark,
  Trophy,
  Heart
} from 'lucide-react';

interface FeedPost {
  id: string;
  title: string;
  story?: string;
  category: 'funding' | 'discussion';
  discussionTag?: string;
  studentName?: string;
  college?: string;
  datePosted: string;
  subjectCode?: string;
  goal?: number;
  raised?: number;
  commentsCount?: number;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  status?: string;
  created_at?: string;
  student_name?: string;
}

function FeedContent() {
  const { requireAuthAction } = useAuth();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [savedPostsMap, setSavedPostsMap] = useState<Record<string, boolean>>({});
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);

  const categories = [
    { id: 'all', label: 'All Posts', emoji: '🌐' },
    { id: 'funding', label: 'Fee Appeal', emoji: '🏆' },
    { id: 'general', label: 'General Discussion', emoji: '💬' },
    { id: 'confession', label: 'Confession', emoji: '🤫' },
    { id: 'complaint', label: 'Complaint', emoji: '⚠️' },
    { id: 'question', label: 'Question', emoji: '❓' },
    { id: 'request', label: 'Request', emoji: '🤝' },
    { id: 'urgent', label: 'Urgent', emoji: '🚨' },
    { id: 'gossip', label: 'Gossip', emoji: '☕' },
  ];

  // LISTEN TO URL QUERY PARAMETERS (?category=funding or ?category=all)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadSupabasePosts() {
      // Fetch posts directly from Supabase database
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts from Supabase:', error.message);
      } else {
        const mapped = (data || []).map((p: any) => ({
          ...p,
          discussionTag: p.subject_code || p.discussionTag || p.discussion_tag || 'general',
        }));
        setFeedPosts(mapped);
      }

      const map = JSON.parse(localStorage.getItem('saved_posts_map') || '{}');
      setSavedPostsMap(map);
    }

    loadSupabasePosts();
  }, []);

  const handleCreateNewClick = () => {
    requireAuthAction(() => {
      window.location.href = '/profile';
    });
  };

  const toggleSavePost = (postId: string) => {
    requireAuthAction(() => {
      const updatedMap = {
        ...savedPostsMap,
        [postId]: !savedPostsMap[postId]
      };
      setSavedPostsMap(updatedMap);
      localStorage.setItem('saved_posts_map', JSON.stringify(updatedMap));
    });
  };

  const getAuthorInitials = (name?: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const filteredPosts = feedPosts.filter(post => {
    const matchesSearch = 
      (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.story && post.story.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.college && post.college.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'funding') return matchesSearch && post.category === 'funding';
    
    const tag = (post.discussionTag || (post as any).subject_code || '').toLowerCase();
    return matchesSearch && tag.includes(selectedCategory.toLowerCase());
  });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 my-auto w-full">
      
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
          onClick={handleCreateNewClick}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" /> Create New Post
        </button>
      </div>

      {/* SEARCH BAR & CATEGORY FILTERS */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts by subject, college, or keywords..."
            className="w-full bg-[#1E1E1E] border border-slate-800 focus:border-blue-500 text-white text-xs sm:text-sm rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none shadow-md"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2.5 rounded-xl border transition whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20 font-bold' 
                  : 'bg-[#1E1E1E] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PUBLIC POSTS FEED CONTAINER */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-3xl p-12 border border-slate-800 text-center space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-slate-400 text-sm">No posts found in this category.</p>
            <button 
              onClick={handleCreateNewClick}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20"
            >
              Create a Post
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const postRoute = `/post/${post.id}`;
            const authorName = post.student_name || post.studentName || 'Student Account';
            const initials = getAuthorInitials(authorName);

            const goalAmount = post.goal || 2000;
            const raisedAmount = post.raised || 0;
            const percentage = Math.min(100, Math.round((raisedAmount / goalAmount) * 100));

            return (
              <div 
                key={post.id} 
                className="bg-[#1C1C1E] rounded-3xl p-6 sm:p-8 border border-slate-800/90 space-y-5 shadow-2xl relative"
              >
                
                {/* AUTHOR HEADER BAR */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-extrabold text-xs rounded-lg flex items-center justify-center shrink-0">
                      {initials}
                    </span>
                    <span className="font-extrabold text-white text-base sm:text-lg">
                      {authorName}
                    </span>

                    {post.category === 'funding' ? (
                      <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-bold text-xs flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Fee Appeal
                      </span>
                    ) : (
                      (post.discussionTag || (post as any).subject_code) && (
                        <span className="bg-purple-950/80 text-purple-300 border border-purple-800/80 px-2.5 py-0.5 rounded-full font-bold text-xs capitalize">
                          {post.discussionTag || (post as any).subject_code}
                        </span>
                      )
                    )}

                    {post.college && (
                      <span className="bg-blue-950/80 text-blue-400 border border-blue-800/80 px-2.5 py-0.5 rounded-md font-bold text-xs">
                        {post.college}
                      </span>
                    )}
                  </div>

                  <span className="text-slate-400 text-xs font-medium">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Just now'}
                  </span>
                </div>

                {/* POST TITLE */}
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                  <Link href={postRoute} className="hover:text-blue-400 transition">
                    {post.title}
                  </Link>
                </h2>

                {/* FULL STORY QUOTE BOX */}
                {post.story && (
                  <div className="bg-[#121214] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-inner">
                    <p className="text-slate-200 text-xs sm:text-sm italic leading-relaxed font-sans font-medium whitespace-pre-wrap">
                      "{post.story}"
                    </p>
                  </div>
                )}

                {/* MEDIA PREVIEW */}
                {post.mediaUrl && (
                  <div className="w-full bg-[#121212] border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center max-h-[450px]">
                    {post.mediaType === 'video' ? (
                      <video src={post.mediaUrl} controls className="w-full max-h-[450px] object-contain rounded-2xl" />
                    ) : (
                      <img src={post.mediaUrl} alt={post.title} className="w-full max-h-[450px] object-contain rounded-2xl" />
                    )}
                  </div>
                )}

                {/* MONEY BAR */}
                {post.category === 'funding' && (
                  <div className="bg-[#121214] p-4 rounded-2xl border border-slate-800/80 space-y-3">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                      <span className="text-white">
                        ₹{raisedAmount} <span className="font-normal text-slate-400">raised of ₹{goalAmount}</span>
                      </span>
                      <span className="text-amber-400 font-extrabold">
                        {percentage}% Funded
                      </span>
                    </div>
                    <div className="w-full bg-slate-800/90 h-3 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* BOTTOM ACTION BUTTONS BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={postRoute}
                      className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-2 transition"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" /> {post.commentsCount || 0} comments
                    </Link>

                    <Link 
                      href={postRoute}
                      className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-2 transition"
                    >
                      <ExternalLink className="w-4 h-4" /> Full post
                    </Link>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + postRoute);
                        alert('Post link copied to clipboard!');
                      }}
                      className="p-2.5 bg-[#121212] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 transition"
                      title="Share Post"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link 
                      href={postRoute}
                      className="px-4 py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold border border-slate-800 flex items-center gap-2 transition"
                    >
                      <Users className="w-4 h-4 text-blue-400" /> Join discussion
                    </Link>

                    {post.category === 'funding' && (
                      <Link 
                        href={`/donate/${post.id}`}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current text-rose-300" /> Donate →
                      </Link>
                    )}

                    <button 
                      onClick={() => toggleSavePost(post.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                        savedPostsMap[post.id] 
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20' 
                          : 'bg-[#121212] hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" /> {savedPostsMap[post.id] ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </main>
  );
}

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <Navbar />
      <Suspense fallback={
        <div className="text-center py-20 text-xs text-slate-400">Loading Campus Feed...</div>
      }>
        <FeedContent />
      </Suspense>
      {/* <Footer /> */}
    </div>
  );
}