'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, 
  Heart, 
  Bookmark, 
  Activity, 
  PlusCircle, 
  Trash2, 
  ShieldCheck, 
  Receipt, 
  ExternalLink, 
  MessageSquare, 
  ThumbsUp, 
  X, 
  Tag, 
  Clock, 
  Printer, 
  AlertCircle, 
  FileCheck2, 
  LogOut, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';

interface DonorRecord {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  time: string;
  txId: string;
}

interface UserPost {
  id: string;
  title: string;
  category: 'funding' | 'discussion';
  discussionTag?: 'confession' | 'request' | 'urgent' | 'gossip' | 'general';
  datePosted: string;
  subjectCode?: string;
  subjectGrade?: string;
  goal?: number;
  raised?: number;
  status: 'pending_verification' | 'active' | 'rejected';
  rejectionReason?: string;
  commentsCount: number;
  donors?: DonorRecord[];
  bankDetails?: {
    upiId: string;
    accountNumber: string;
    ifscCode: string;
  };
}

interface ActivityItem {
  id: string;
  type: 'comment' | 'upvote';
  postTitle: string;
  postId: string;
  timeAgo: string;
  content?: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'comment',
    postTitle: 'Just ₹50 away from my goal — anxiety disorder during exams',
    postId: 'post-1',
    timeAgo: '2 hours ago',
    content: 'Stay strong Divya! Sent ₹50 via UPI. You will clear this easily.'
  },
  {
    id: 'act-2',
    type: 'upvote',
    postTitle: 'Cleared my back, got placed at Microsoft, donated ₹5,000 back',
    postId: 'post-2',
    timeAgo: '1 day ago'
  }
];

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, currentUser, user, isLoading, logout } = useAuth();

  // STRICT ADMIN ROUTE GUARD: Redirect Admin accounts directly to /admin
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        return; // Handled below in Guest View
      }

      const userEmail = currentUser?.email?.toLowerCase() || user?.email?.toLowerCase() || '';
      const isAdmin = 
        currentUser?.is_admin === true || 
        currentUser?.role === 'admin' || 
        userEmail === 'collegeeasy.official@gmail.com' ||
        userEmail === 'dalalrohit824@gmail.com';

      if (isAdmin) {
        window.location.href = '/admin';
      }
    }
  }, [isLoggedIn, isLoading, currentUser, user, router]);

  const [activeTab, setActiveTab] = useState<'posts' | 'donations' | 'saved' | 'activity'>('posts');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Sample User Posts
  const [userPosts, setUserPosts] = useState<UserPost[]>([
    {
      id: 'post-101',
      title: 'Need assistance clearing Digital Electronics re-appear fee',
      category: 'funding',
      datePosted: '2 hours ago',
      subjectCode: 'EC-202',
      subjectGrade: 'F Grade',
      goal: 2000,
      raised: 0,
      status: 'pending_verification',
      commentsCount: 0,
      bankDetails: {
        upiId: 'rohit@okicici',
        accountNumber: 'XXXX-XXXX-9912',
        ifscCode: 'SBIN0001234'
      }
    },
    {
      id: 'post-102',
      title: 'Signals and Systems Re-appear Exam Fee Support',
      category: 'funding',
      datePosted: '1 day ago',
      subjectCode: 'EC-301',
      subjectGrade: 'F Grade',
      goal: 2500,
      raised: 0,
      status: 'rejected',
      rejectionReason: 'Fee receipt image was blurred and roll number was unreadable. Please re-upload a clear copy.',
      commentsCount: 0,
      bankDetails: {
        upiId: 'rohit@okicici',
        accountNumber: 'XXXX-XXXX-9912',
        ifscCode: 'SBIN0001234'
      }
    },
    {
      id: 'post-103',
      title: 'Condensed Matter Physics Re-appear Exam Fee',
      category: 'funding',
      datePosted: '3 days ago',
      subjectCode: 'EP-204',
      subjectGrade: 'F Grade',
      goal: 1800,
      raised: 1200,
      status: 'active',
      commentsCount: 12,
      bankDetails: {
        upiId: 'rohit@okicici',
        accountNumber: 'XXXX-XXXX-9912',
        ifscCode: 'SBIN0001234'
      }
    }
  ]);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'funding' | 'discussion'>('funding');
  const [newDiscussionTag, setNewDiscussionTag] = useState<'confession' | 'request' | 'urgent' | 'gossip' | 'general'>('general');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectGrade, setNewSubjectGrade] = useState('');
  const [newGoal, setNewGoal] = useState<number>(1000);
  const [newStory, setNewStory] = useState('');

  // Payout Details
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Document Uploads
  const [collegeIdFile, setCollegeIdFile] = useState<File | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [feeChallanFile, setFeeChallanFile] = useState<File | null>(null);

  // Dynamic Initials Generator
  const getInitials = () => {
    const name = currentUser?.full_name || user?.email || 'User';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setUserPosts(userPosts.filter(p => p.id !== postId));
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const isFunding = newCategory === 'funding';

    const createdPost: UserPost = {
      id: `post-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      discussionTag: !isFunding ? newDiscussionTag : undefined,
      datePosted: 'Just now',
      subjectCode: isFunding ? newSubjectCode : undefined,
      subjectGrade: isFunding ? newSubjectGrade : undefined,
      goal: isFunding ? newGoal : undefined,
      raised: isFunding ? 0 : undefined,
      status: isFunding ? 'pending_verification' : 'active',
      commentsCount: 0,
      bankDetails: isFunding ? {
        upiId,
        accountNumber,
        ifscCode
      } : undefined
    };

    setUserPosts([createdPost, ...userPosts]);
    setShowCreateModal(false);

    setNewTitle('');
    setNewStory('');
    setNewSubjectCode('');
    setNewSubjectGrade('');
    setUpiId('');
    setAccountNumber('');
    setIfscCode('');
    setCollegeIdFile(null);
    setResultFile(null);
    setFeeChallanFile(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading Profile Data...</p>
        </div>
      </div>
    );
  }

  // Guest Mode View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-28 pb-20 flex flex-col items-center justify-center px-4">
        <Navbar />
        <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Guest Mode Active</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            You are currently browsing as a guest. Please sign in or create an account to access your profile dashboard and publish appeals.
          </p>
          <Link 
            href="/login"
            className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            Sign In / Register
          </Link>
        </div>
      </div>
    );
  }

  const displayName = currentUser?.full_name || user?.email || 'Student Account';
  const isDonor = currentUser?.role === 'donor';

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans selection:bg-blue-500 selection:text-white pt-24 pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 space-y-8">
        
        {/* PROFILE HEADER */}
        <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white font-black text-2xl rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 border border-blue-400/30 shrink-0">
              {getInitials()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">{displayName}</h1>
                <span className={`px-2.5 py-0.5 rounded-md font-semibold text-xs flex items-center gap-1 border ${
                  isDonor 
                    ? 'bg-purple-950 text-purple-300 border-purple-800' 
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" /> {isDonor ? 'Verified Supporter' : 'Verified Student'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                {currentUser?.college || currentUser?.occupation || 'DTU'} 
                {currentUser?.branch ? ` • ${currentUser.branch}` : ''} 
                {currentUser?.year ? ` (${currentUser.year})` : ''}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Member since {currentUser?.member_since || '2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 font-bold text-xs rounded-xl border border-rose-800/80 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>

            {!isDonor && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" /> Create Post / Appeal
              </button>
            )}
          </div>
        </div>

        {/* PROFILE TABS */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'posts' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> My Posts ({userPosts.length})
          </button>

          <button 
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'donations' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" /> Donations Made
          </button>

          <button 
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'activity' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-400" /> Recent Activity
          </button>

          <button 
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'saved' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4 text-purple-400" /> Saved Posts
          </button>
        </div>

        {/* TAB 1: MY POSTS */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {userPosts.length === 0 ? (
              <div className="bg-[#1E1E1E] rounded-2xl p-12 border border-slate-800 text-center space-y-3">
                <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-slate-400 text-sm">You haven't created any posts or appeals yet.</p>
                {!isDonor && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20"
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            ) : (
              userPosts.map(post => {
                const exactRoute = post.category === 'funding' ? `/donate/${post.id}` : `/post/${post.id}`;

                return (
                  <div key={post.id} className="bg-[#1E1E1E] rounded-2xl p-6 border border-slate-800 space-y-5 shadow-lg">
                    
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs uppercase ${
                          post.category === 'funding' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}>
                          {post.category === 'funding' ? 'Fee Appeal' : 'Discussion'}
                        </span>

                        {post.status === 'pending_verification' && (
                          <span className="bg-amber-950/80 text-amber-400 border border-amber-800 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Under Admin Review
                          </span>
                        )}

                        {post.status === 'active' && (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Live & Verified
                          </span>
                        )}

                        {post.status === 'rejected' && (
                          <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Appeal Rejected
                          </span>
                        )}

                        {post.discussionTag && (
                          <span className="bg-purple-950/80 text-purple-300 border border-purple-800 px-2 py-0.5 rounded text-[11px] font-semibold capitalize flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {post.discussionTag}
                          </span>
                        )}

                        <span className="text-slate-400 text-xs">{post.datePosted}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {post.status === 'active' && (
                          <Link 
                            href={exactRoute}
                            className="px-3.5 py-1.5 bg-[#121212] hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Live
                          </Link>
                        )}
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg text-xs font-semibold border border-rose-800 flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {post.status === 'active' ? (
                        <Link href={exactRoute} className="hover:text-blue-400 transition">
                          {post.title}
                        </Link>
                      ) : (
                        post.title
                      )}
                    </h3>

                    {post.status === 'pending_verification' && (
                      <div className="bg-amber-950/30 border border-amber-800/60 p-4 rounded-xl text-xs text-amber-300 space-y-2">
                        <p className="font-bold flex items-center gap-1.5 text-amber-200">
                          <AlertCircle className="w-4 h-4 text-amber-400" /> Bank & Document Verification Pending
                        </p>
                        <p className="text-slate-400 leading-relaxed">
                          Your uploaded marksheet and bank account details ({post.bankDetails?.upiId}) are currently being verified by admin. Upon approval, your appeal will become live.
                        </p>
                      </div>
                    )}

                    {post.status === 'rejected' && post.rejectionReason && (
                      <div className="bg-rose-950/40 border border-rose-800/80 p-4 rounded-xl text-xs text-rose-300 space-y-1">
                        <span className="font-bold uppercase tracking-wider block text-rose-200">Admin Rejection Reason:</span>
                        <p className="leading-relaxed">{post.rejectionReason}</p>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: DONATIONS MADE */}
        {activeTab === 'donations' && (
          <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-400" /> My Contribution History
            </h3>
            <p className="text-xs text-slate-400">
              Official 0% commission records of funds transferred directly to fellow Delhi students.
            </p>

            <div className="space-y-3 pt-2">
              <div className="bg-[#121212] p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded text-[10px]">100% DIRECT TRANSFER</span>
                  <p className="font-bold text-white text-sm">Divya Singh (NSUT) - Digital Electronics Back Fee</p>
                  <p className="text-slate-400">Transaction Ref: <span className="font-mono text-slate-300">CB-DIRECT-68291469</span> • 2 hours ago</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                  <span className="text-base font-extrabold text-white">₹50.00</span>
                  <button 
                    onClick={() => setSelectedReceipt({
                      txId: 'CB-DIRECT-68291469',
                      razorpayId: 'pay_direct_vphei6x7b',
                      amount: 50,
                      date: '31 July 2026',
                      time: '03:05:11 PM',
                      donorName: currentUser?.full_name || 'Rohit Dalal',
                      studentName: 'Divya Singh',
                      college: 'NSUT (Netaji Subhas University of Technology)',
                      upiId: 'divyasingh@okicici',
                      subjectCode: 'EC-202'
                    })}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition shadow-md shadow-blue-600/20"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECENT ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" /> Platform Interactions
            </h3>

            <div className="space-y-3">
              {INITIAL_ACTIVITIES.map(act => (
                <div key={act.id} className="bg-[#121212] p-4 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      {act.type === 'comment' ? <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> : <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />}
                      {act.type === 'comment' ? 'Commented on' : 'Upvoted'}
                    </span>
                    <span>{act.timeAgo}</span>
                  </div>
                  <Link href={`/post/${act.postId}`} className="font-bold text-white hover:text-blue-400 transition block text-sm">
                    "{act.postTitle}"
                  </Link>
                  {act.content && (
                    <p className="text-slate-300 italic bg-[#181818] p-2.5 rounded-lg border border-slate-800">
                      "{act.content}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SAVED POSTS */}
        {activeTab === 'saved' && (
          <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-purple-400" /> Bookmarked Discussions
            </h3>

            <div className="bg-[#121212] p-4 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <span className="text-blue-400 font-bold bg-blue-950 px-2 py-0.5 rounded text-[10px]">DTU Discussion</span>
                <p className="font-bold text-white text-sm">Which DEC is better for 5th Sem Engineering Physics: Quantum Optics or Solid State?</p>
                <p className="text-slate-400">Saved 3 days ago • 18 Comments</p>
              </div>
              <Link 
                href="/post/post-3" 
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition shrink-0"
              >
                Open
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* FULL MATCH RECEIPT PRINT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-[2.5rem] p-8 sm:p-10 max-w-2xl w-full space-y-6 shadow-2xl relative my-8 print:p-0 print:border-none print:shadow-none font-sans border border-slate-200">
            
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 p-1.5 rounded-full transition print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div className="space-y-1">
                <div className="text-3xl font-black tracking-tight text-slate-900">
                  come<span className="text-blue-600">Back</span>
                </div>
                <p className="text-xs font-bold text-slate-500">Direct Peer-to-Peer Student Support Network</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  collegeeasy.official@gmail.com • 0% Platform Commission
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
                  DIRECT PAYMENT SLIP
                </span>
                <p className="text-xs font-mono text-slate-500 pt-1">
                  Receipt ID: <span className="font-bold text-slate-700">{selectedReceipt.txId || 'CB-DIRECT-68291469'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">DATE</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedReceipt.date || '31 July 2026'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">TIME</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedReceipt.time || '03:05:11 PM'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">GATEWAY REF</span>
                <span className="font-mono font-semibold text-slate-700 truncate block text-xs">{selectedReceipt.razorpayId || 'pay_direct_vphei6x7b'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">PAYOUT FEE</span>
                <span className="font-extrabold text-emerald-600 text-sm">₹0.00 (0% Fee)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1.5">
                  DONOR DETAILS
                </h4>
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-700">Name:</span> <span className="font-mono text-slate-900">{selectedReceipt.donorName || 'Rohit Dalal'}</span></p>
                  <p><span className="font-bold text-slate-700">Payment Route:</span> <span className="text-slate-800">Direct Razorpay UPI/Card</span></p>
                </div>
              </div>

              <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1.5">
                  DIRECT STUDENT BENEFICIARY
                </h4>
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-700">Student:</span> <span className="font-bold text-slate-900">{selectedReceipt.studentName || 'Divya Singh'}</span></p>
                  <p className="leading-snug"><span className="font-bold text-slate-700">College:</span> <span className="text-slate-800">{selectedReceipt.college || 'NSUT (Netaji Subhas University of Technology)'}</span></p>
                  <p><span className="font-bold text-slate-700">Student UPI/VPA:</span> <span className="font-mono text-slate-900">{selectedReceipt.upiId || 'divyasingh@okicici'}</span></p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                    <th className="py-2.5">DESCRIPTION</th>
                    <th className="py-2.5 text-right">AMOUNT (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">
                      Direct Exam Re-Appear Fee Contribution ({selectedReceipt.subjectCode || 'EC-202'})
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">₹{selectedReceipt.amount || 50}.00</td>
                  </tr>
                  <tr className="text-slate-400 italic">
                    <td className="py-2">comeBACK Platform Fee</td>
                    <td className="py-2 text-right font-semibold text-emerald-600">₹0.00</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-center">
                <span className="font-black text-base text-slate-900">Total Direct Transfer to Student</span>
                <span className="font-black text-2xl text-blue-600">₹{selectedReceipt.amount || 50}.00</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-500 bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center text-[8px] font-black leading-tight text-center p-1">
                  <span>100%</span>
                  <span>DIRECT</span>
                  <span>P2P</span>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <p className="font-black text-slate-900 text-sm">Rohit Dalal</p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Platform Manager • comeBACK</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4 print:hidden">
              <button 
                onClick={() => window.print()}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95"
              >
                <Printer className="w-4 h-4" /> Print / Download PDF Receipt
              </button>

              <button 
                onClick={() => setSelectedReceipt(null)}
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[88vh] overflow-y-auto space-y-6 shadow-2xl relative scrollbar-thin scrollbar-thumb-slate-700">
            
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Create New Post or Fee Appeal</h2>
              <p className="text-xs text-slate-400">100% of donations go directly to your verified bank account.</p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs sm:text-sm">
              
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Post Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => setNewCategory('funding')}
                    className={`py-2.5 rounded-xl font-bold border transition ${
                      newCategory === 'funding' 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20' 
                        : 'bg-[#121212] border-slate-800 text-slate-400'
                    }`}
                  >
                    Fee Re-Appear Appeal
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewCategory('discussion')}
                    className={`py-2.5 rounded-xl font-bold border transition ${
                      newCategory === 'discussion' 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20' 
                        : 'bg-[#121212] border-slate-800 text-slate-400'
                    }`}
                  >
                    Campus Discussion
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Title *</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Need assistance clearing Digital Electronics re-appear fee..."
                  className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-3 focus:outline-none"
                />
              </div>

              {newCategory === 'funding' && (
                <div className="space-y-4 bg-[#121212] p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4" /> Academic & Exam Details
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Subject Code *</label>
                      <input 
                        type="text"
                        required
                        value={newSubjectCode}
                        onChange={(e) => setNewSubjectCode(e.target.value)}
                        placeholder="e.g. EC-202"
                        className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-2.5 focus:outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Subject Grade *</label>
                      <input 
                        type="text"
                        required
                        value={newSubjectGrade}
                        onChange={(e) => setNewSubjectGrade(e.target.value)}
                        placeholder="e.g. F Grade / Absent"
                        className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-2.5 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Official Fee Target (INR) *</label>
                    <input 
                      type="number"
                      required
                      value={newGoal}
                      onChange={(e) => setNewGoal(Number(e.target.value))}
                      placeholder="e.g. 2000"
                      className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-2.5 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> Direct Payout Settlement Destination
                    </span>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">UPI ID / VPA *</label>
                      <input 
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. rohit@okicici"
                        className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-2.5 focus:outline-none text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">Bank Account Number *</label>
                        <input 
                          type="text"
                          required
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Account No."
                          className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-2.5 focus:outline-none text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">IFSC Code *</label>
                        <input 
                          type="text"
                          required
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                          placeholder="e.g. SBIN0001234"
                          className="w-full bg-[#181818] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-2.5 focus:outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                    <label className="font-bold text-slate-300 block">Mandatory Document Proofs</label>
                    
                    <div className="bg-[#181818] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">1. College Student ID:</span>
                      <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded cursor-pointer transition">
                        {collegeIdFile ? collegeIdFile.name : 'Choose File'}
                        <input type="file" required accept="image/*,.pdf" onChange={(e) => setCollegeIdFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    </div>

                    <div className="bg-[#181818] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">2. Marksheet / Result Sheet:</span>
                      <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded cursor-pointer transition">
                        {resultFile ? resultFile.name : 'Choose File'}
                        <input type="file" required accept="image/*,.pdf" onChange={(e) => setResultFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    </div>

                    <div className="bg-[#181818] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">3. Fee Notice / Challan:</span>
                      <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded cursor-pointer transition">
                        {feeChallanFile ? feeChallanFile.name : 'Choose File'}
                        <input type="file" required accept="image/*,.pdf" onChange={(e) => setFeeChallanFile(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    </div>
                  </div>

                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Full Story / Details *</label>
                <textarea 
                  required
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                  placeholder="Explain your situation in detail..."
                  className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-3 focus:outline-none resize-none min-h-[80px]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full py-3 bg-[#121212] hover:bg-slate-800 text-slate-400 font-semibold rounded-xl border border-slate-800 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
                >
                  {newCategory === 'funding' ? 'Submit Appeal for Verification' : 'Publish Discussion'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}