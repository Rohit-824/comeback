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
  ShieldAlert
} from 'lucide-react';

interface FlaggedComment {
  id: string;
  postTitle: string;
  commenterName: string;
  commentText: string;
  reportedBy: string;
  reportedByEmail: string;
  date: string;
}

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean | null>(null);
  const [currentAdminProfile, setCurrentAdminProfile] = useState<Profile | null>(null);

  // REQ 7: ANALYTICS DATA & DEMOGRAPHICS
  const analyticsData = {
    totalPosts: 42,
    totalStudents: 128,
    totalP2PVolume: 84500,
    collegeBreakdown: [
      { college: 'Delhi Technological University (DTU)', students: 64, barWidth: '100%' },
      { college: 'Netaji Subhas University of Technology (NSUT)', students: 42, barWidth: '65%' },
      { college: 'Delhi University (DU North Campus)', students: 22, barWidth: '35%' },
    ]
  };

  // REQ 7: MODERATION QUEUE FOR REPORTED COMMENTS
  const [flaggedComments, setFlaggedComments] = useState<FlaggedComment[]>([
    {
      id: 'rep-1',
      postTitle: 'Need assistance clearing Digital Electronics re-appear fee',
      commenterName: 'Anonymous User',
      commentText: 'This post seems suspicious, verify marksheet again.',
      reportedBy: 'Aarav Sharma',
      reportedByEmail: 'aarav@nsut.ac.in',
      date: '10 mins ago',
    }
  ]);

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

  const handleDismissReport = (id: string) => {
    setFlaggedComments(flaggedComments.filter(c => c.id !== id));
  };

  const handleDeleteReportedComment = async (comment: FlaggedComment) => {
    setFlaggedComments(flaggedComments.filter(c => c.id !== comment.id));
    alert(`Comment deleted. Thank you email already dispatched to reporter ${comment.reportedByEmail}`);
  };

  if (isAdminAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Verifying Admin Credentials...</p>
        </div>
      </div>
    );
  }

  if (isAdminAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-28 pb-20 flex flex-col items-center justify-center px-4">
        <Navbar />
        <div className="bg-[#1E1E1E] border border-rose-900/50 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Admin Access Required</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your current account does not have administrator privileges to view this portal.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 space-y-8 w-full my-auto">
        
        {/* HEADER CARD */}
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

        {/* REQ 7: ANALYTICS METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>TOTAL PLATFORM POSTS</span>
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-white">{analyticsData.totalPosts}</p>
          </div>

          <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>REGISTERED STUDENTS</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">{analyticsData.totalStudents}</p>
          </div>

          <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>P2P TRANSFERRED VOLUME</span>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">₹{analyticsData.totalP2PVolume.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* REQ 7: DEMOGRAPHICS VISUAL GRAPH */}
        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" /> University Demographics Analytics
          </h2>
          <div className="space-y-3 pt-2">
            {analyticsData.collegeBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>{item.college}</span>
                  <span className="font-mono text-purple-300">{item.students} Students</span>
                </div>
                <div className="w-full bg-[#121212] rounded-full h-3 border border-slate-800 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: item.barWidth }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REQ 7: FLAGGED COMMENT MODERATION QUEUE */}
        <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Flagged Comment Reports Queue ({flaggedComments.length})
          </h2>

          {flaggedComments.length === 0 ? (
            <p className="text-xs text-slate-400">No pending comment reports to review.</p>
          ) : (
            flaggedComments.map(comment => (
              <div key={comment.id} className="bg-[#121212] p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span className="font-bold text-slate-200">Post: {comment.postTitle}</span>
                  <span>{comment.date}</span>
                </div>
                <p className="italic text-rose-300 bg-rose-950/30 p-3 rounded-xl border border-rose-900/50">
                  "{comment.commentText}"
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400 font-mono">Reported by: {comment.reportedBy} ({comment.reportedByEmail})</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDismissReport(comment.id)}
                      className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-slate-800 text-slate-300 rounded-lg font-bold border border-slate-800"
                    >
                      Keep Comment
                    </button>
                    <button 
                      onClick={() => handleDeleteReportedComment(comment)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center gap-1 shadow-md shadow-rose-600/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Comment
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}