'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  Heart, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Receipt, 
  Building2, 
  QrCode, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export default function DonatePage() {
  const params = useParams();
  const postId = params?.id as string;
  const router = useRouter();
  const { currentUser, user } = useAuth();

  const [campaign, setCampaign] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [donationAmount, setDonationAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTx, setCompletedTx] = useState<any | null>(null);

  // FETCH CAMPAIGN WITH SUPABASE + LOCALSTORAGE FALLBACK
  useEffect(() => {
    async function fetchCampaign() {
      if (!postId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // 1. Try Supabase
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .maybeSingle();

      if (data) {
        setCampaign({
          id: data.id,
          title: data.title,
          story: data.story,
          studentName: data.student_name || 'Student',
          college: data.college || 'DTU',
          subjectCode: data.subject_code || 'EXAM',
          goal: data.goal || 2000,
          raised: data.raised || 0,
          upiId: data.bankDetails?.upiId || 'student@okicici',
        });
      } else {
        // 2. Fallback to LocalStorage
        const localPosts = JSON.parse(localStorage.getItem('user_posts') || '[]');
        const feedPosts = JSON.parse(localStorage.getItem('feed_posts') || '[]');
        const allLocal = [...localPosts, ...feedPosts];
        const found = allLocal.find((p: any) => p.id === postId);

        if (found) {
          setCampaign({
            id: found.id,
            title: found.title,
            story: found.story,
            studentName: found.studentName || found.student_name || 'Student',
            college: found.college || 'DTU',
            subjectCode: found.subjectCode || found.subject_code || 'EXAM',
            goal: found.goal || 2000,
            raised: found.raised || 0,
            upiId: found.bankDetails?.upiId || 'student@okicici',
          });
        } else {
          setNotFound(true);
        }
      }
      setLoading(false);
    }

    fetchCampaign();
  }, [postId]);

  useEffect(() => {
    if (currentUser?.full_name) setDonorName(currentUser.full_name);
    if (currentUser?.email || user?.email) setDonorEmail(currentUser?.email || user?.email || '');
  }, [currentUser, user]);

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? Number(customAmount) : donationAmount;
    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const txRecord = {
        id: `tx-${Date.now()}`,
        txId: `CB-DIR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        razorpayId: `pay_P2P_${Math.random().toString(36).substring(7)}`,
        donorName: donorName || 'Supporter',
        donorEmail: donorEmail || 'supporter@gmail.com',
        studentName: campaign.studentName,
        studentCollege: campaign.college,
        studentUpi: campaign.upiId || 'student@okicici',
        subjectCode: campaign.subjectCode,
        campaignTitle: campaign.title,
        amount: finalAmount,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        time: new Date().toLocaleTimeString(),
        timeAgo: 'Just now'
      };

      // Save user donations & global logs
      const existingUserDonations = JSON.parse(localStorage.getItem('user_donations') || '[]');
      localStorage.setItem('user_donations', JSON.stringify([txRecord, ...existingUserDonations]));

      const existingGlobalTx = JSON.parse(localStorage.getItem('global_transactions') || '[]');
      localStorage.setItem('global_transactions', JSON.stringify([txRecord, ...existingGlobalTx]));

      // Save user activity
      const existingActivities = JSON.parse(localStorage.getItem('user_activities') || '[]');
      localStorage.setItem('user_activities', JSON.stringify([
        {
          id: `act-${Date.now()}`,
          type: 'donation',
          postTitle: campaign.title,
          timeAgo: 'Just now',
          content: `Contributed ₹${finalAmount} directly via P2P UPI transfer.`
        },
        ...existingActivities
      ]));

      setIsProcessing(false);
      setCompletedTx(txRecord);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading Secure Donation Portal...</p>
        </div>
      </div>
    );
  }

  if (notFound || !campaign) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-28 pb-20 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-4 my-auto w-full text-center space-y-4">
          <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-8 space-y-4 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h1 className="text-xl font-bold text-white">Campaign Not Found</h1>
            <p className="text-xs text-slate-400">The requested fee appeal may have been fulfilled or is pending review.</p>
            <Link href="/feed" className="inline-block w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg">
              Back to Campus Feed
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (completedTx) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-lg mx-auto px-4 w-full my-auto space-y-6">
          <div className="bg-[#1E1E1E] rounded-3xl p-8 border border-emerald-800/60 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-800 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-white">Direct Transfer Successful!</h1>
              <p className="text-xs text-slate-400">Funds transferred 100% commission-free directly to student UPI.</p>
            </div>

            <div className="bg-[#121212] p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
              <p className="text-slate-400">Transaction ID: <span className="font-mono text-white">{completedTx.txId}</span></p>
              <p className="text-slate-400">Beneficiary: <span className="font-bold text-white">{completedTx.studentName} ({completedTx.studentCollege})</span></p>
              <p className="text-slate-400">Amount Donated: <span className="font-black text-emerald-400 text-base">₹{completedTx.amount}.00</span></p>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/profile" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition">
                View in Profile History
              </Link>
              <Link href="/feed" className="w-full py-3 bg-[#121212] hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition">
                Back to Feed
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 w-full my-auto">
        <Link href="/feed" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Campus Feed
        </Link>

        <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between text-xs">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Direct P2P Transfer (0% Fee)
            </span>
            <span className="text-slate-400">{campaign.college}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">{campaign.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 italic bg-[#121212] p-4 rounded-xl border border-slate-800">
              &ldquo;{campaign.story}&rdquo;
            </p>
          </div>

          <form onSubmit={handleDonateSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Select Contribution Amount (INR)</label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setDonationAmount(amt); setCustomAmount(''); }}
                    className={`py-3 rounded-xl font-black text-xs sm:text-sm border transition ${
                      donationAmount === amt && !customAmount 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30' 
                        : 'bg-[#121212] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-300">Or Custom Amount (₹)</label>
              <input 
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="e.g. 250"
                className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-3 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Your Name *</label>
                <input 
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Rohit Dalal"
                  className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Your Email *</label>
                <input 
                  type="email"
                  required
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="e.g. rohit@dtu.ac.in"
                  className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Direct Transfer...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current text-rose-300" />
                  Proceed to Direct UPI Transfer (₹{customAmount ? customAmount : donationAmount})
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}