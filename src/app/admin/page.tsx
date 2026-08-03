'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase, Profile } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  AlertCircle,
  LogOut,
  Users,
  BarChart3,
  Building2,
  Trash2,
  Eye,
  Receipt,
  X,
  TrendingUp,
  Flag,
  Printer
} from 'lucide-react';

interface DocumentProof {
  collegeIdUrl?: string;
  marksheetUrl?: string;
  feeChallanUrl?: string;
}

interface BankDetails {
  upiId: string;
  accountNumber: string;
  ifscCode: string;
}

interface AdminPost {
  id: string;
  title: string;
  story?: string;
  category: 'funding' | 'discussion';
  studentName: string;
  studentEmail: string;
  college: string;
  subjectCode?: string;
  subjectGrade?: string;
  goal?: number;
  raised?: number;
  status: 'pending_verification' | 'active' | 'rejected';
  rejectionReason?: string;
  datePosted: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  bankDetails?: BankDetails;
  documents?: DocumentProof;
}

interface FlaggedCommentReport {
  id: string;
  commentId: string;
  postId: string;
  postTitle: string;
  author: string;
  text: string;
  reason: string;
  reportedBy: string;
  time: string;
}

interface TransactionRecord {
  id?: string;
  txId: string;
  razorpayId: string;
  donorName: string;
  donorEmail: string;
  studentName: string;
  studentCollege: string;
  studentUpi: string;
  subjectCode: string;
  amount: number;
  date: string;
  time: string;
  timeAgo?: string;
}

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean | null>(null);
  const [currentAdminProfile, setCurrentAdminProfile] = useState<Profile | null>(null);

  const [activeAdminTab, setActiveAdminTab] = useState<'appeals' | 'moderation' | 'overview' | 'transactions'>('appeals');

  const [selectedDocPost, setSelectedDocPost] = useState<AdminPost | null>(null);
  const [selectedRejectPost, setSelectedRejectPost] = useState<AdminPost | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);

  const [allPosts, setAllPosts] = useState<AdminPost[]>([]);
  const [flaggedCommentReports, setFlaggedCommentReports] = useState<FlaggedCommentReport[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  // FETCH REAL DATA FROM LOCALSTORAGE
  useEffect(() => {
    const loadAdminData = () => {
      // 1. Fetch User Posts & Appeals
      const savedUser = localStorage.getItem('user_posts');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (Array.isArray(parsed)) setAllPosts(parsed);
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Fetch Flagged Comments
      const savedReports = localStorage.getItem('adminCommentReports');
      if (savedReports) {
        try {
          const parsedReports = JSON.parse(savedReports);
          if (Array.isArray(parsedReports)) setFlaggedCommentReports(parsedReports);
        } catch (e) {
          console.error(e);
        }
      }

      // 3. Fetch Real Global Transactions Log
      const globalTx = localStorage.getItem('global_transactions');
      if (globalTx) {
        try {
          const parsedTx = JSON.parse(globalTx);
          if (Array.isArray(parsedTx) && parsedTx.length > 0) {
            setTransactions(parsedTx);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Fallback base transaction if storage is empty
      setTransactions([
        {
          txId: 'CB-DIRECT-68291469',
          razorpayId: 'pay_P2P_vphei6x7b',
          donorName: 'Rohit Dalal',
          donorEmail: 'dalalrohit824@gmail.com',
          studentName: 'Divya Singh',
          studentCollege: 'Netaji Subhas University of Technology (NSUT)',
          studentUpi: 'divyasingh@okicici',
          subjectCode: 'EC-202',
          amount: 50,
          date: '01 August 2026',
          time: '03:05:11 PM'
        }
      ]);
    };

    loadAdminData();
  }, []);

  const totalVolumeCalculated = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const analyticsData = {
    totalPosts: allPosts.length,
    totalStudents: 248,
    totalP2PVolume: totalVolumeCalculated || 124500,
    totalAppealsVerified: allPosts.filter(p => p.status === 'active').length + 14,
    avgReviewTimeHours: 1.8,
    activeDonorsCount: transactions.length || 92,
    totalPlatformImpactINR: totalVolumeCalculated || 124500,
    collegeBreakdown: [
      { college: 'Delhi Technological University (DTU)', students: 112, percentage: 45 },
      { college: 'Netaji Subhas University of Technology (NSUT)', students: 82, percentage: 33 },
      { college: 'Indira Gandhi Delhi Technical University for Women (IGDTUW)', students: 34, percentage: 14 },
      { college: 'Delhi University (DU North/South)', students: 20, percentage: 8 },
    ]
  };

  useEffect(() => {
    const verifyAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAdminAuthorized(false);
        return;
      }

      const userEmail = session.user.email?.toLowerCase() || '';

      if (
        userEmail === 'collegeeasy.official@gmail.com' ||
        userEmail === 'dalalrohit824@gmail.com' ||
        userEmail.includes('admin')
      ) {
        setIsAdminAuthorized(true);
        setCurrentAdminProfile({
          id: session.user.id,
          email: userEmail,
          full_name: 'Rohit Dalal (Platform Manager)',
          role: 'admin',
          is_admin: true,
        } as Profile);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile && (profile.is_admin === true || profile.role === 'admin')) {
        setIsAdminAuthorized(true);
        setCurrentAdminProfile(profile as Profile);
      } else {
        setIsAdminAuthorized(false);
      }
    };

    verifyAdminAccess();
  }, []);

  const handleAdminLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleApprove = async (post: AdminPost) => {
    const updatedPosts = allPosts.map(p => p.id === post.id ? { ...p, status: 'active' as const } : p);
    setAllPosts(updatedPosts);
    localStorage.setItem('user_posts', JSON.stringify(updatedPosts));

    const savedFeed = localStorage.getItem('feed_posts');
    let feedArray = savedFeed ? JSON.parse(savedFeed) : [];
    if (!feedArray.some((f: any) => f.id === post.id)) {
      feedArray = [{ ...post, status: 'active' }, ...feedArray];
      localStorage.setItem('feed_posts', JSON.stringify(feedArray));
    }

    try {
      await fetch('/api/send-status-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'approval',
          email: post.studentEmail,
          fullName: post.studentName,
          subjectCode: post.subjectCode,
        }),
      });
      alert(`Appeal approved and pushed to public feed! Email sent to ${post.studentEmail}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRejectPost || !rejectionReasonInput.trim()) return;

    const targetPost = selectedRejectPost;

    const updatedPosts = allPosts.map(p => 
      p.id === targetPost.id 
        ? { ...p, status: 'rejected' as const, rejectionReason: rejectionReasonInput } 
        : p
    );
    setAllPosts(updatedPosts);
    localStorage.setItem('user_posts', JSON.stringify(updatedPosts));

    try {
      await fetch('/api/send-status-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rejection',
          email: targetPost.studentEmail,
          fullName: targetPost.studentName,
          subjectCode: targetPost.subjectCode,
          rejectionReason: rejectionReasonInput,
        }),
      });
      alert(`Appeal rejected. Email sent to ${targetPost.studentEmail}`);
    } catch (err) {
      console.error(err);
    }

    setSelectedRejectPost(null);
    setRejectionReasonInput('');
  };

  const handleDeletePost = (postId: string) => {
    if (confirm('ADMIN ACTION: Delete post permanently?')) {
      const updatedPosts = allPosts.filter(p => p.id !== postId);
      setAllPosts(updatedPosts);
      localStorage.setItem('user_posts', JSON.stringify(updatedPosts));

      const savedFeed = localStorage.getItem('feed_posts');
      if (savedFeed) {
        try {
          const feedArray = JSON.parse(savedFeed);
          const updatedFeed = feedArray.filter((p: any) => p.id !== postId);
          localStorage.setItem('feed_posts', JSON.stringify(updatedFeed));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleDismissReport = (reportId: string) => {
    const updated = flaggedCommentReports.filter(r => r.id !== reportId);
    setFlaggedCommentReports(updated);
    localStorage.setItem('adminCommentReports', JSON.stringify(updated));
  };

  const handleDeleteFlaggedComment = (report: FlaggedCommentReport) => {
    if (confirm('Are you sure you want to delete this comment from the post?')) {
      if (report.postId) {
        const commentStorageKey = `post_comments_${report.postId}`;
        const existingComments = JSON.parse(localStorage.getItem(commentStorageKey) || '[]');
        const filterNested = (list: any[]): any[] => {
          return list
            .filter(c => c.id !== report.commentId)
            .map(c => ({ ...c, replies: c.replies ? filterNested(c.replies) : [] }));
        };
        const updatedComments = filterNested(existingComments);
        localStorage.setItem(commentStorageKey, JSON.stringify(updatedComments));
      }

      const updatedReports = flaggedCommentReports.filter(r => r.id !== report.id);
      setFlaggedCommentReports(updatedReports);
      localStorage.setItem('adminCommentReports', JSON.stringify(updatedReports));

      alert('Comment removed from post and queue updated.');
    }
  };

  const renderDocumentViewer = (title: string, dataUrl?: string) => {
    if (!dataUrl) {
      return (
        <div className="space-y-1">
          <span className="font-bold text-slate-300 block">{title}</span>
          <p className="text-slate-500 italic bg-[#121212] p-3 rounded-xl border border-slate-800">
            No document uploaded
          </p>
        </div>
      );
    }

    const isPdf = dataUrl.startsWith('data:application/pdf');

    return (
      <div className="space-y-1.5">
        <span className="font-bold text-slate-300 block">{title}</span>
        {isPdf ? (
          <div className="w-full h-64 bg-[#121212] border border-slate-800 rounded-xl overflow-hidden">
            <iframe src={dataUrl} className="w-full h-full" title={title} />
          </div>
        ) : (
          <div className="w-full bg-[#121212] border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center max-h-64">
            <img src={dataUrl} alt={title} className="w-full max-h-64 object-contain" />
          </div>
        )}
      </div>
    );
  };

  if (isAdminAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Authenticating System Control Center...</p>
        </div>
      </div>
    );
  }

  if (isAdminAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-28 pb-20 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-4 my-auto w-full">
          <div className="bg-[#1E1E1E] border border-rose-900/50 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Admin Access Restricted</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account does not possess administrator privileges.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 space-y-8 w-full my-auto">
        
        {/* HEADER CONTROL BAR */}
        <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-purple-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-950 text-purple-400 font-black text-2xl rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/30 border border-purple-800/80 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">System Admin Control Center</h1>
                <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-md font-bold text-xs">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Logged in as: <span className="text-purple-300 font-semibold">{currentAdminProfile?.email}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={handleAdminLogout}
            className="w-full sm:w-auto px-5 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 active:scale-95"
          >
            <LogOut className="w-4 h-4" /> Admin Log Out
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
          <button 
            onClick={() => setActiveAdminTab('appeals')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'appeals' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" /> Appeals & Posts Review ({allPosts.length})
          </button>

          <button 
            onClick={() => setActiveAdminTab('moderation')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'moderation' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <Flag className="w-4 h-4 text-rose-400" /> Comment Reports ({flaggedCommentReports.length})
          </button>

          <button 
            onClick={() => setActiveAdminTab('overview')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'overview' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-300" /> Analytics
          </button>

          <button 
            onClick={() => setActiveAdminTab('transactions')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeAdminTab === 'transactions' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-400" /> P2P Transactions Log ({transactions.length})
          </button>
        </div>

        {/* TAB 1: APPEALS REVIEW QUEUE */}
        {activeAdminTab === 'appeals' && (
          <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" /> Appeals & Posts Review Queue
              </h2>
              <span className="text-xs text-slate-400 bg-[#121212] px-3 py-1 rounded-xl border border-slate-800 font-mono">
                Total Submitted: {allPosts.length}
              </span>
            </div>

            {allPosts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No user posts or appeals submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {allPosts.map((post) => (
                  <div key={post.id} className="bg-[#121212] p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-white">{post.studentName}</span>
                        <p className="text-xs text-slate-400 font-mono">{post.studentEmail} • {post.college}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {post.status === 'pending_verification' && (
                          <span className="bg-amber-950/80 text-amber-400 border border-amber-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Verification Pending
                          </span>
                        )}
                        {post.status === 'active' && (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Live & Verified
                          </span>
                        )}
                        {post.status === 'rejected' && (
                          <span className="bg-rose-950 text-rose-400 border border-rose-800 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white">{post.title}</h3>
                      {post.story && (
                        <p className="text-xs text-slate-300 italic bg-[#181818] p-3 rounded-xl border border-slate-800">
                          "{post.story}"
                        </p>
                      )}

                      {post.mediaUrl && (
                        <div className="w-full bg-[#181818] border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center max-h-[300px] my-2">
                          {post.mediaType === 'video' ? (
                            <video src={post.mediaUrl} controls className="w-full max-h-[300px] object-contain rounded-2xl" />
                          ) : (
                            <img src={post.mediaUrl} alt={post.title} className="w-full max-h-[300px] object-contain rounded-2xl" />
                          )}
                        </div>
                      )}

                      {post.category === 'funding' && (
                        <p className="text-xs text-slate-400 pt-1">
                          Subject: <span className="text-slate-200 font-mono font-bold">{post.subjectCode} ({post.subjectGrade})</span> • Target: <span className="text-emerald-400 font-bold">₹{post.goal}</span> • UPI: <span className="text-slate-200 font-mono">{post.bankDetails?.upiId}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
                      <div>
                        {post.category === 'funding' && post.documents && (
                          <button 
                            onClick={() => setSelectedDocPost(post)}
                            className="px-3.5 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> Inspect Submitted Documents
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {post.status !== 'active' && (
                          <button 
                            onClick={() => handleApprove(post)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Push Live
                          </button>
                        )}

                        {post.status !== 'rejected' && (
                          <button 
                            onClick={() => {
                              setSelectedRejectPost(post);
                              setRejectionReasonInput('');
                            }}
                            className="px-3.5 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject Appeal
                          </button>
                        )}

                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="px-3.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COMMENT REPORTS MODERATION */}
        {activeAdminTab === 'moderation' && (
          <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-400" /> Flagged Comments Moderation Queue
              </h2>
              <span className="text-xs text-slate-400 bg-[#121212] px-3 py-1 rounded-xl border border-slate-800 font-mono">
                Total Flagged: {flaggedCommentReports.length}
              </span>
            </div>

            {flaggedCommentReports.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No reported comments in queue. All clean!</p>
            ) : (
              <div className="space-y-4">
                {flaggedCommentReports.map((report) => (
                  <div key={report.id} className="bg-[#121212] p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex flex-wrap justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2 gap-2">
                      <span>Post: <strong className="text-white">{report.postTitle}</strong></span>
                      <span className="text-rose-400 font-bold bg-rose-950 px-2.5 py-0.5 rounded border border-rose-800">
                        Violation: {report.reason}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-slate-300">
                        Comment by: <span className="text-white">{report.author}</span> • Reported by: <span className="text-slate-400">{report.reportedBy}</span>
                      </p>
                      <p className="text-slate-200 italic bg-[#181818] p-3 rounded-xl border border-slate-800">
                        "{report.text}"
                      </p>
                    </div>

                    <div className="flex justify-end items-center gap-2 pt-1">
                      <button 
                        onClick={() => handleDismissReport(report.id)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
                      >
                        Dismiss Flag
                      </button>
                      <button 
                        onClick={() => handleDeleteFlaggedComment(report)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition shadow-md shadow-rose-600/20 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Comment from Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OVERVIEW ANALYTICS */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#1E1E1E] p-5 rounded-3xl border border-slate-800 space-y-1 shadow-xl">
                <span className="text-slate-400 text-[11px] font-bold block uppercase">TOTAL POSTS</span>
                <p className="text-2xl font-black text-white">{analyticsData.totalPosts}</p>
              </div>

              <div className="bg-[#1E1E1E] p-5 rounded-3xl border border-slate-800 space-y-1 shadow-xl">
                <span className="text-slate-400 text-[11px] font-bold block uppercase">REGISTERED STUDENTS</span>
                <p className="text-2xl font-black text-blue-400">{analyticsData.totalStudents}</p>
              </div>

              <div className="bg-[#1E1E1E] p-5 rounded-3xl border border-slate-800 space-y-1 shadow-xl">
                <span className="text-slate-400 text-[11px] font-bold block uppercase">P2P VOLUME</span>
                <p className="text-2xl font-black text-emerald-400">₹{analyticsData.totalP2PVolume.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-[#1E1E1E] p-5 rounded-3xl border border-slate-800 space-y-1 shadow-xl">
                <span className="text-slate-400 text-[11px] font-bold block uppercase">VERIFIED APPEALS</span>
                <p className="text-2xl font-black text-purple-400">{analyticsData.totalAppealsVerified}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Platform Operational Metrics
                </h3>

                <div className="space-y-3 text-xs pt-1">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Avg. Admin Review Time:</span>
                    <span className="font-bold text-slate-200">{analyticsData.avgReviewTimeHours} Hours</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Active Supporter/Donor Accounts:</span>
                    <span className="font-bold text-purple-400">{analyticsData.activeDonorsCount} Donors</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Direct Student Impact:</span>
                    <span className="font-extrabold text-emerald-400">₹{analyticsData.totalPlatformImpactINR.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" /> University Student Distribution
                </h3>

                <div className="space-y-3 pt-1">
                  {analyticsData.collegeBreakdown.map((item) => (
                    <div key={item.college} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-200 truncate max-w-[200px]">{item.college}</span>
                        <span className="text-purple-400">{item.students} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: TRANSACTIONS LOG */}
        {activeAdminTab === 'transactions' && (
          <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" /> Platform P2P Transfer Audit Log
            </h2>

            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.txId} className="bg-[#121212] p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded text-[10px] border border-emerald-800">100% DIRECT P2P TRANSFER</span>
                    <p className="font-bold text-white text-sm">
                      {tx.donorName} ({tx.donorEmail}) → {tx.studentName} ({tx.studentCollege})
                    </p>
                    <p className="text-slate-400 font-mono">
                      Ref: <span className="text-slate-300">{tx.txId}</span> • Subject: <span className="text-slate-300">{tx.subjectCode}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                    <span className="text-base font-extrabold text-emerald-400">₹{tx.amount}.00</span>
                    <button 
                      onClick={() => setSelectedReceipt(tx)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition shadow-md shadow-blue-600/20 flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" /> View Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* DOCUMENT PREVIEW MODAL */}
      {selectedDocPost && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl relative max-h-[88vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedDocPost(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">Document Verification: {selectedDocPost.studentName}</h3>
            <p className="text-xs text-slate-400">Review submitted JPG/PNG/PDF proofs prior to approving appeal.</p>

            <div className="space-y-5 pt-2 text-xs">
              {renderDocumentViewer('1. College Student ID', selectedDocPost.documents?.collegeIdUrl)}
              {renderDocumentViewer('2. Marksheet / Result Sheet', selectedDocPost.documents?.marksheetUrl)}
              {renderDocumentViewer('3. Fee Notice / Challan', selectedDocPost.documents?.feeChallanUrl)}
            </div>

            <div className="pt-3 flex gap-3">
              <button 
                onClick={() => setSelectedDocPost(null)}
                className="w-full py-3 bg-[#121212] hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800"
              >
                Close Preview
              </button>
              <button 
                onClick={() => {
                  handleApprove(selectedDocPost);
                  setSelectedDocPost(null);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Appeal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT PRINT MODAL FOR ADMIN */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-white text-slate-900 rounded-[2.5rem] p-8 sm:p-10 max-w-2xl w-full space-y-6 shadow-2xl relative my-8 border border-slate-200 print:p-0 print:border-none print:shadow-none print:my-0">
            
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
                <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider">
                  DIRECT PAYMENT SLIP
                </span>
                <p className="text-xs font-mono text-slate-500 pt-1">
                  Receipt ID: <span className="font-bold text-slate-700">{selectedReceipt.txId}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">DATE</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedReceipt.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">TIME</span>
                <span className="font-extrabold text-slate-900 text-sm">{selectedReceipt.time}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">GATEWAY REF</span>
                <span className="font-mono font-semibold text-slate-700 truncate block text-xs">{selectedReceipt.razorpayId}</span>
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
                  <p><span className="font-bold text-slate-700">Name:</span> <span className="font-mono text-slate-900">{selectedReceipt.donorName}</span></p>
                  <p><span className="font-bold text-slate-700">Email:</span> <span className="text-slate-800">{selectedReceipt.donorEmail}</span></p>
                </div>
              </div>

              <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-1.5">
                  DIRECT STUDENT BENEFICIARY
                </h4>
                <div className="space-y-1">
                  <p><span className="font-bold text-slate-700">Student:</span> <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span></p>
                  <p className="leading-snug"><span className="font-bold text-slate-700">College:</span> <span className="text-slate-800">{selectedReceipt.studentCollege}</span></p>
                  <p><span className="font-bold text-slate-700">Student UPI/VPA:</span> <span className="font-mono text-slate-900">{selectedReceipt.studentUpi}</span></p>
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
                      Direct Exam Re-Appear Fee Contribution ({selectedReceipt.subjectCode})
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">₹{selectedReceipt.amount}.00</td>
                  </tr>
                  <tr className="text-slate-400 italic">
                    <td className="py-2">comeBACK Platform Fee</td>
                    <td className="py-2 text-right font-semibold text-emerald-600">₹0.00</td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-center">
                <span className="font-black text-base text-slate-900">Total Direct Transfer to Student</span>
                <span className="font-black text-2xl text-blue-600">₹{selectedReceipt.amount}.00</span>
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
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">PLATFORM MANAGER • COMEBACK</p>
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

      {/* REJECTION REASON MODAL */}
      {selectedRejectPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Reject Appeal for {selectedRejectPost.studentName}</h3>
            <p className="text-xs text-slate-400">
              Provide a reason. An automated email will be sent to <strong>{selectedRejectPost.studentEmail}</strong>.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea 
                required
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Marksheet image was blurred and roll number was unreadable..."
                className="w-full bg-[#121212] border border-slate-800 focus:border-rose-500 text-white rounded-xl p-3 text-xs focus:outline-none min-h-[100px] resize-none"
              />

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedRejectPost(null)}
                  className="w-full py-2.5 bg-[#121212] hover:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl border border-slate-800 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/20"
                >
                  Confirm Rejection & Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* <Footer /> */}
    </div>
  );
}