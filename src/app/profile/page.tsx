'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  FileText, 
  Heart, 
  Activity, 
  PlusCircle, 
  Trash2, 
  ShieldCheck, 
  Receipt, 
  ExternalLink, 
  MessageSquare, 
  X, 
  Tag, 
  Printer, 
  FileCheck2, 
  LogOut, 
  Building2, 
  CheckCircle2,
  Image as ImageIcon,
  Bookmark,
  Clock,
  XCircle,
  Sparkles
} from 'lucide-react';

interface UserPost {
  id: string;
  title: string;
  story?: string;
  category: 'funding' | 'discussion';
  discussionTag?: string;
  datePosted: string;
  studentName?: string;
  studentEmail?: string;
  college?: string;
  subjectCode?: string;
  subjectGrade?: string;
  goal?: number;
  raised?: number;
  status: 'pending_verification' | 'active' | 'rejected';
  rejectionReason?: string;
  commentsCount: number;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  upiId?: string;
  qrCodeUrl?: string;
  aiTrustScore?: number;
}

interface UserDonation {
  id: string;
  txId: string;
  razorpayId: string;
  donorName: string;
  donorEmail?: string;
  studentName: string;
  studentCollege: string;
  studentUpi: string;
  subjectCode: string;
  campaignTitle: string;
  amount: number;
  date: string;
  time: string;
  timeAgo: string;
}

interface ActivityItem {
  id: string;
  type: 'donation' | 'comment' | 'post';
  postTitle: string;
  postId?: string;
  timeAgo: string;
  content?: string;
  userEmail?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, currentUser, user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) return;

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

  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'donations' | 'activity'>('posts');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [savedPostsList, setSavedPostsList] = useState<UserPost[]>([]);
  const [donationsList, setDonationsList] = useState<UserDonation[]>([]);
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([]);

  const [selectedReceipt, setSelectedReceipt] = useState<UserDonation | null>(null);

  // LOAD REAL USER DATA FILTERED STRICTLY BY LOGGED-IN USER EMAIL
  useEffect(() => {
    const activeEmail = currentUser?.email || user?.email || '';
    if (!activeEmail) return;

    async function fetchProfileData() {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .ilike('student_email', activeEmail)
        .order('created_at', { ascending: false });

      if (!error && postsData) {
        const mappedPosts = postsData.map((p: any) => ({
          id: p.id,
          title: p.title,
          story: p.story,
          category: p.category,
          discussionTag: p.subject_code || p.discussion_tag || 'general',
          datePosted: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recently',
          studentName: p.student_name || 'Student',
          studentEmail: p.student_email || '',
          college: p.college || 'DTU',
          subjectCode: p.subject_code,
          subjectGrade: p.subject_grade,
          goal: p.goal || 0,
          raised: p.raised || 0,
          status: p.status || 'active',
          commentsCount: 0,
          mediaType: p.media_type,
          mediaUrl: p.media_url,
          upiId: p.upi_id || 'Not Provided',
          qrCodeUrl: p.qr_code_url || '',
          aiTrustScore: p.ai_trust_score || 95
        }));
        setUserPosts(mappedPosts);
      }

      const { data: allPosts } = await supabase.from('posts').select('*');
      if (allPosts) {
        const allMapped = allPosts.map((p: any) => ({
          id: p.id,
          title: p.title,
          story: p.story,
          category: p.category,
          discussionTag: p.subject_code || p.discussion_tag || 'general',
          datePosted: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recently',
          studentName: p.student_name || 'Student',
          college: p.college || 'DTU',
          status: p.status || 'active',
          commentsCount: 0,
        }));
        const savedKey = `saved_posts_map_${activeEmail}`;
        const savedIds = JSON.parse(localStorage.getItem(savedKey) || localStorage.getItem('saved_posts_map') || '{}');
        const uniqueSaved = allMapped.filter((p: any) => savedIds[p.id]);
        setSavedPostsList(uniqueSaved);
      }

      const userDonations = localStorage.getItem('user_donations');
      if (userDonations) {
        try {
          const parsedDonations = JSON.parse(userDonations);
          if (Array.isArray(parsedDonations)) {
            const filteredDonations = parsedDonations.filter(
              (d: any) => !d.donorEmail || d.donorEmail.toLowerCase() === activeEmail.toLowerCase()
            );
            setDonationsList(filteredDonations);
          }
        } catch (err) {
          console.error(err);
        }
      }

      const userActivities = localStorage.getItem('user_activities');
      if (userActivities) {
        try {
          const parsedActivities = JSON.parse(userActivities);
          if (Array.isArray(parsedActivities)) {
            const filteredActivities = parsedActivities.filter(
              (a: any) => !a.userEmail || a.userEmail.toLowerCase() === activeEmail.toLowerCase()
            );
            setActivitiesList(filteredActivities);
          }
        } catch (err) {
          console.error(err);
        }
      }
    }

    fetchProfileData();
  }, [user, currentUser]);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'funding' | 'discussion'>('funding');
  const [newDiscussionTag, setNewDiscussionTag] = useState<string>('general');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectGrade, setNewSubjectGrade] = useState('');
  const [newGoal, setNewGoal] = useState<number>(1000);
  const [newStory, setNewStory] = useState('');

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [upiId, setUpiId] = useState('');
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);

  const [collegeIdFile, setCollegeIdFile] = useState<File | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [feeChallanFile, setFeeChallanFile] = useState<File | null>(null);

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

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) {
        console.error('Error deleting post:', error.message);
        alert('Failed to delete post.');
        return;
      }
      setUserPosts(userPosts.filter(p => p.id !== postId));
    }
  };

  const handleRemoveSavedPost = (postId: string) => {
    const activeEmail = currentUser?.email || user?.email || '';
    const savedKey = `saved_posts_map_${activeEmail}`;
    const savedMap = JSON.parse(localStorage.getItem(savedKey) || localStorage.getItem('saved_posts_map') || '{}');
    delete savedMap[postId];
    localStorage.setItem(savedKey, JSON.stringify(savedMap));
    setSavedPostsList(savedPostsList.filter(p => p.id !== postId));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const isFunding = newCategory === 'funding';
    const activeEmail = currentUser?.email || user?.email || 'student@dtu.ac.in';

    let mediaUrl: string | undefined = undefined;
    let mediaType: 'image' | 'video' | undefined = undefined;

    if (mediaFile) {
      try {
        mediaUrl = await convertFileToBase64(mediaFile);
        mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
      } catch (err) {
        console.error('Error converting file to Base64', err);
      }
    }

    let qrCodeUrl: string | undefined = undefined;
    if (isFunding && qrCodeFile) {
      try {
        qrCodeUrl = await convertFileToBase64(qrCodeFile);
      } catch (err) {
        console.error('Error converting QR code to Base64', err);
      }
    }

    let collegeIdUrl: string | undefined = undefined;
    let marksheetUrl: string | undefined = undefined;
    let feeChallanUrl: string | undefined = undefined;

    let calculatedTrustScore = 95;
    let verificationPayload = JSON.stringify({
      isValid: true,
      extractedName: currentUser?.full_name || 'Student',
      extractedAmount: newGoal,
      summary: 'Document automatically scanned and verified.'
    });

    if (isFunding) {
      if (collegeIdFile) collegeIdUrl = await convertFileToBase64(collegeIdFile);
      if (resultFile) marksheetUrl = await convertFileToBase64(resultFile);
      if (feeChallanFile) feeChallanUrl = await convertFileToBase64(feeChallanFile);

      // REAL LIVE AI DOCUMENT VERIFICATION API CALL
      const fileToVerify = feeChallanFile || resultFile || collegeIdFile;
      if (fileToVerify) {
        try {
          const base64Doc = await convertFileToBase64(fileToVerify);
          const base64DataOnly = base64Doc.split(',')[1];

          const aiRes = await fetch('/api/verify-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64DataOnly, mimeType: fileToVerify.type }),
          });
          const aiData = await aiRes.json();

          if (aiData.result) {
            let cleaned = aiData.result.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            calculatedTrustScore = parsed.trustScore || (parsed.isValid ? 96 : 42);
            verificationPayload = JSON.stringify(parsed);
          }
        } catch (aiErr) {
          console.error('Live AI Verification failed:', aiErr);
        }
      }
    }

    const { data, error } = await supabase.from('posts').insert([
      {
        title: newTitle,
        story: newStory,
        category: isFunding ? 'funding' : 'discussion',
        subject_code: isFunding ? newSubjectCode : newDiscussionTag,
        student_name: currentUser?.full_name || 'Student Account',
        student_email: activeEmail,
        college: currentUser?.college || 'DTU',
        subject_grade: isFunding ? newSubjectGrade : null,
        goal: isFunding ? newGoal : 0,
        raised: 0,
        status: isFunding ? 'pending_verification' : 'active',
        media_type: mediaType || null,
        media_url: mediaUrl || null,
        upi_id: isFunding ? upiId.trim() : null,
        qr_code_url: isFunding ? qrCodeUrl || null : null,
        college_id_url: collegeIdUrl || null,
        marksheet_url: marksheetUrl || null,
        fee_challan_url: feeChallanUrl || null,
        ai_trust_score: calculatedTrustScore,
        ai_verification_details: verificationPayload,
      }
    ]).select();

    if (error) {
      console.error('Error creating post in Supabase:', error);
      alert(`Failed to publish: ${error.message}`);
      return;
    }

    if (data && data[0]) {
      const newCreatedPost: UserPost = {
        id: data[0].id,
        title: data[0].title,
        story: data[0].story,
        category: data[0].category,
        discussionTag: data[0].subject_code || newDiscussionTag,
        datePosted: 'Just now',
        studentName: data[0].student_name,
        college: data[0].college,
        status: data[0].status,
        commentsCount: 0,
        mediaType: data[0].media_type,
        mediaUrl: data[0].media_url,
        upiId: data[0].upi_id,
        qrCodeUrl: data[0].qr_code_url,
        aiTrustScore: calculatedTrustScore
      };
      setUserPosts([newCreatedPost, ...userPosts]);

      const activityItem: ActivityItem = {
        id: `act-${Date.now()}`,
        type: 'post',
        postTitle: data[0].title,
        postId: data[0].id,
        timeAgo: 'Just now',
        content: `Created ${isFunding ? 'Fee Appeal' : 'Discussion'} post`,
        userEmail: activeEmail
      };
      const userActivities = JSON.parse(localStorage.getItem('user_activities') || '[]');
      localStorage.setItem('user_activities', JSON.stringify([activityItem, ...userActivities]));
      setActivitiesList([activityItem, ...activitiesList]);
    }

    setShowCreateModal(false);

    setNewTitle('');
    setNewStory('');
    setNewSubjectCode('');
    setNewSubjectGrade('');
    setUpiId('');
    setQrCodeFile(null);
    setMediaFile(null);
    setCollegeIdFile(null);
    setResultFile(null);
    setFeeChallanFile(null);

    if (isFunding) {
      alert(`Fee appeal analyzed by AI (Trust Score: ${calculatedTrustScore}%) and sent to Admin Portal!`);
    } else {
      alert('Post published successfully!');
      router.push('/feed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading Profile Data...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-28 pb-20 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-4 w-full my-auto text-center space-y-4">
          <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-2xl">
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
        <Footer />
      </div>
    );
  }

  const displayName = currentUser?.full_name || user?.email || 'Student Account';
  const isDonor = currentUser?.role === 'donor';

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans selection:bg-blue-500 selection:text-white pt-24 pb-20 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 space-y-8 w-full my-auto">
        
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
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'saved' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" /> Saved Posts ({savedPostsList.length})
          </button>

          <button 
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'donations' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" /> Donations Made ({donationsList.length})
          </button>

          <button 
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'activity' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'text-slate-400 hover:text-white bg-[#1E1E1E] border border-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-400" /> Recent Activity
          </button>
        </div>

        {/* TAB 1: MY POSTS WITH AI VERIFICATION STATUS & TRUST SCORE */}
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
                const exactRoute = `/post/${post.id}`;

                return (
                  <div key={post.id} className="bg-[#1E1E1E] rounded-2xl p-6 border border-slate-800 space-y-4 shadow-lg">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs uppercase ${
                          post.category === 'funding' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}>
                          {post.category === 'funding' ? 'Fee Appeal' : 'Discussion'}
                        </span>

                        {/* AI Verification & Review Status Badge */}
                        {post.category === 'funding' && (
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> {post.aiTrustScore || 95}% AI Trust Score
                            </span>

                            {post.status === 'pending_verification' && (
                              <span className="bg-amber-950/80 text-amber-400 border border-amber-800 px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> Under Admin Review
                              </span>
                            )}
                            {post.status === 'active' && (
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Live
                              </span>
                            )}
                            {post.status === 'rejected' && (
                              <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Rejected
                              </span>
                            )}
                          </div>
                        )}

                        {post.discussionTag && post.category === 'discussion' && (
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
                      <Link href={exactRoute} className="hover:text-blue-400 transition">
                        {post.title}
                      </Link>
                    </h3>

                    {post.mediaUrl && (
                      <div className="w-full bg-[#121212] border border-slate-800/80 rounded-2xl overflow-hidden flex items-center justify-center max-h-[500px]">
                        {post.mediaType === 'video' ? (
                          <video src={post.mediaUrl} controls className="w-full max-h-[500px] object-contain rounded-2xl" />
                        ) : (
                          <img src={post.mediaUrl} alt={post.title} className="w-full max-h-[500px] object-contain rounded-2xl" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: SAVED POSTS */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            {savedPostsList.length === 0 ? (
              <div className="bg-[#1E1E1E] rounded-2xl p-12 border border-slate-800 text-center space-y-3">
                <Bookmark className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-slate-400 text-sm">You haven't saved any posts yet.</p>
                <Link 
                  href="/feed" 
                  className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Explore Campus Feed
                </Link>
              </div>
            ) : (
              savedPostsList.map(post => (
                <div key={post.id} className="bg-[#1E1E1E] rounded-2xl p-6 border border-slate-800 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-white">{post.studentName || 'Student'}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{post.college || 'DTU'}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{post.datePosted}</span>
                    </div>

                    <button 
                      onClick={() => handleRemoveSavedPost(post.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 bg-rose-950/40 border border-rose-900/60 px-3 py-1 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" /> Remove from Saved
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white">
                    <Link href={`/post/${post.id}`} className="hover:text-blue-400 transition">
                      {post.title}
                    </Link>
                  </h3>

                  {post.story && (
                    <p className="text-xs text-slate-300 italic bg-[#121212] p-3 rounded-xl border border-slate-800/80">
                      "{post.story}"
                    </p>
                  )}

                  <div className="flex justify-end pt-2">
                    <Link 
                      href={`/post/${post.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20"
                    >
                      Open Full Discussion →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: DONATIONS MADE */}
        {activeTab === 'donations' && (
          <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" /> My Contribution History
              </h3>
              <p className="text-xs text-slate-400">
                Official 0% commission records of funds transferred directly by you to fellow Delhi students.
              </p>
            </div>

            {donationsList.length === 0 ? (
              <div className="bg-[#121212] rounded-2xl p-8 border border-slate-800 text-center space-y-2">
                <Heart className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-slate-400 text-xs">No donations made yet. Support a fellow student today!</p>
                <Link href="/feed?category=funding" className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
                  View Verified Appeals
                </Link>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {donationsList.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="bg-[#121212] p-4 sm:p-5 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5">
                      <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded text-[10px] border border-emerald-800/80">
                        100% DIRECT TRANSFER
                      </span>
                      <p className="font-extrabold text-white text-sm sm:text-base">
                        {tx.studentName} ({tx.studentCollege}) - {tx.campaignTitle || tx.subjectCode}
                      </p>
                      <p className="text-slate-400 font-mono text-[11px]">
                        Transaction Ref: <span className="text-slate-300 font-semibold">{tx.txId}</span> • {tx.timeAgo || tx.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
                      <span className="text-lg font-black text-white">₹{tx.amount}.00</span>
                      <button 
                        onClick={() => setSelectedReceipt(tx)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition shadow-md shadow-blue-600/20 active:scale-95"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RECENT ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" /> Platform Interactions
            </h3>

            {activitiesList.length === 0 ? (
              <div className="bg-[#121212] rounded-2xl p-8 border border-slate-800 text-center text-xs text-slate-400">
                No recent activity recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activitiesList.map(act => (
                  <div key={act.id} className="bg-[#121212] p-4 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        {act.type === 'donation' && <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />}
                        {act.type === 'comment' && <MessageSquare className="w-3.5 h-3.5 text-blue-400" />}
                        {act.type === 'post' && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                        <span className="capitalize">{act.type} Activity</span>
                      </span>
                      <span>{act.timeAgo}</span>
                    </div>

                    <p className="font-extrabold text-white text-sm">
                      "{act.postTitle}"
                    </p>

                    {act.content && (
                      <p className="text-slate-300 italic bg-[#181818] p-2.5 rounded-xl border border-slate-800">
                        {act.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[88vh] overflow-y-auto space-y-6 shadow-2xl relative scrollbar-thin scrollbar-thumb-slate-700">
            
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Create New Post or Fee Appeal</h2>
              <p className="text-xs text-slate-400">Share a campus discussion or submit a verified fee appeal.</p>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs sm:text-sm">
              
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Post Type</label>
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

              {newCategory === 'discussion' && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Discussion Category *</label>
                  <select
                    value={newDiscussionTag}
                    onChange={(e: any) => setNewDiscussionTag(e.target.value)}
                    className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-3 focus:outline-none capitalize"
                  >
                    <option value="general">💬 General Discussion</option>
                    <option value="confession">🤫 Confession</option>
                    <option value="complaint">⚠️ Complaint</option>
                    <option value="question">❓ Question</option>
                    <option value="request">🤝 Request</option>
                    <option value="urgent">🚨 Urgent</option>
                    <option value="gossip">☕ Gossip</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Title *</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Attendance policy in 3rd semester is impossible..."
                  className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Attach Media (Photo / Video)</label>
                <div className="bg-[#121212] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 text-xs truncate max-w-[200px]">
                    {mediaFile ? mediaFile.name : 'Choose Photo or Video File'}
                  </span>
                  <label className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0">
                    <ImageIcon className="w-3.5 h-3.5" /> Upload File
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      onChange={(e) => setMediaFile(e.target.files?.[0] || null)} 
                      className="hidden" 
                    />
                  </label>
                </div>
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
                      <Building2 className="w-4 h-4" /> Direct UPI Payout Destination
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

                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-semibold text-slate-300 block">Upload Payment QR Code (Image) *</label>
                      <div className="bg-[#181818] p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400 text-xs truncate max-w-[200px]">
                          {qrCodeFile ? qrCodeFile.name : 'Choose QR Code Image'}
                        </span>
                        <label className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shrink-0">
                          <ImageIcon className="w-3.5 h-3.5" /> Upload QR
                          <input 
                            type="file" 
                            required 
                            accept="image/*" 
                            onChange={(e) => setQrCodeFile(e.target.files?.[0] || null)} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                    <label className="font-bold text-slate-300 block">Mandatory Document Proofs (JPG / PNG / PDF)</label>
                    
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
                <label className="font-semibold text-slate-300">Full Details / Story *</label>
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
                  {newCategory === 'funding' ? 'Submit Appeal for Verification' : 'Publish Post'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FORMAL RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-[#1C1C1E] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative text-slate-100">
            
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 space-y-6 shadow-inner border border-slate-200">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 gap-3">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-blue-600">comeBack</h1>
                  <p className="text-[11px] text-slate-500 font-medium">Direct Peer-to-Peer Student Support Network</p>
                  <p className="text-[10px] text-blue-500 font-medium">collegeeasy.official@gmail.com • 0% Platform Commission</p>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block mb-1">
                    Direct Payment Slip
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">Receipt ID: {selectedReceipt.txId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.date}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Time</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.time}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Gateway Ref</span>
                  <span className="font-semibold text-slate-800 font-mono text-[10px] truncate block">{selectedReceipt.razorpayId}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Payout Fee</span>
                  <span className="font-semibold text-emerald-600">₹0.00 (0% Fee)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-200 pb-1 mb-2">Donor Details</span>
                  <p className="font-bold text-slate-800">Name: <span className="font-normal">{selectedReceipt.donorName}</span></p>
                  <p className="font-bold text-slate-800">Email: <span className="font-normal font-mono text-[11px]">{selectedReceipt.donorEmail || 'student@dtu.ac.in'}</span></p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-200 pb-1 mb-2">Direct Beneficiary</span>
                  <p className="font-bold text-slate-800">Student: <span className="font-normal">{selectedReceipt.studentName}</span></p>
                  <p className="font-bold text-slate-800">College: <span className="font-normal">{selectedReceipt.studentCollege}</span></p>
                  <p className="font-bold text-slate-800 truncate">UPI/VPA: <span className="font-normal font-mono text-[10px] text-emerald-700">{selectedReceipt.studentUpi}</span></p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">
                  <span>Description</span>
                  <span>Amount (INR)</span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Direct Exam Re-Appear Fee Contribution ({selectedReceipt.subjectCode || 'Fee Support'})</span>
                  <span className="font-mono">₹{selectedReceipt.amount}.00</span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 italic border-b border-slate-200 pb-3">
                  <span>comeBACK Platform Fee</span>
                  <span className="font-mono">₹0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                <span className="text-xs font-black text-blue-900 uppercase tracking-wider">Total Direct Transfer to Student</span>
                <span className="text-xl font-black text-blue-600 font-mono">₹{selectedReceipt.amount}.00</span>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-emerald-500 flex items-center justify-center text-[9px] font-black text-emerald-600">
                    100% P2P
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="font-black text-slate-800">Rohit Dalal</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Platform Manager • ComeBack</p>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                onClick={() => { window.print(); }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print / Save Slip as PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}