'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  FileCheck2, 
  Building2,
  Heart,
  Check,
  QrCode,
  Send,
  Copy,
  X
} from 'lucide-react';

interface FeeAppealPost {
  id: string;
  title: string;
  story?: string;
  category: 'funding' | 'discussion';
  studentName?: string;
  studentEmail?: string;
  college?: string;
  branch?: string;
  year?: string;
  subjectCode?: string;
  goal?: number;
  raised?: number;
  datePosted: string;
  upiId?: string;
  documents?: {
    collegeIdUrl?: string;
    marksheetUrl?: string;
    feeChallanUrl?: string;
  };
}

export default function DonatePage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;
  const { currentUser, user, requireAuthAction } = useAuth();

  const [campaign, setCampaign] = useState<FeeAppealPost | null>(null);
  const [loading, setLoading] = useState(true);

  // DONATION FORM STATE
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('50');
  const [encouragingNote, setEncouragingNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // MANUAL UPI & QR MODAL STATE
  const [step, setStep] = useState<'amount' | 'utr'>('amount');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);

  // FETCH CAMPAIGN WITH SUPABASE + LOCALSTORAGE DUAL-SYNC
  useEffect(() => {
    if (!postId) return;

    const loadPostData = async () => {
      let foundPost: FeeAppealPost | null = null;

      // 1. Query Supabase Database Table First
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .maybeSingle();

      if (!error && data) {
        foundPost = {
          id: data.id,
          title: data.title,
          story: data.story,
          category: data.category,
          studentName: data.student_name || 'Student Beneficiary',
          studentEmail: data.student_email || 'student@dtu.ac.in',
          college: data.college || 'DTU',
          branch: data.branch || 'Engineering Physics',
          year: data.year || '2nd Year',
          subjectCode: data.subject_code || 'EXAM',
          goal: data.goal || 2000,
          raised: data.raised || 0,
          datePosted: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Recently',
          upiId: data.upi_id || 'Not Provided'
        };
      }

      // 2. Fallback to localStorage user_posts / feed_posts if not in Supabase yet
      if (!foundPost) {
        const savedUserPosts = localStorage.getItem('user_posts');
        if (savedUserPosts) {
          try {
            const parsed = JSON.parse(savedUserPosts);
            if (Array.isArray(parsed)) {
              const matched = parsed.find((p: any) => p.id === postId);
              if (matched) {
                foundPost = {
                  ...matched,
                  upiId: matched.upi_id || matched.bankDetails?.upiId || 'Not Provided'
                };
              }
            }
          } catch (e) {
            console.error('Error parsing user_posts:', e);
          }
        }
      }

      if (!foundPost) {
        const savedFeedPosts = localStorage.getItem('feed_posts');
        if (savedFeedPosts) {
          try {
            const parsedFeed = JSON.parse(savedFeedPosts);
            if (Array.isArray(parsedFeed)) {
              const matched = parsedFeed.find((p: any) => p.id === postId);
              if (matched) {
                foundPost = {
                  ...matched,
                  upiId: matched.upi_id || matched.bankDetails?.upiId || 'Not Provided'
                };
              }
            }
          } catch (e) {
            console.error('Error parsing feed_posts:', e);
          }
        }
      }

      setCampaign(foundPost);
      setLoading(false);
    };

    loadPostData();
  }, [postId]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setSelectedAmount(num);
    } else {
      setSelectedAmount(0);
    }
  };

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || selectedAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    requireAuthAction(() => {
      setShowUpiModal(true);
    });
  };

  const handleCopyUpi = () => {
    if (campaign?.upiId) {
      navigator.clipboard.writeText(campaign.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProceedToUtr = () => {
    setShowUpiModal(false);
    setStep('utr');
  };

  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 8) {
      alert('Please enter a valid 12-digit UTR / Transaction Reference number from your UPI app.');
      return;
    }

    setIsProcessing(true);

    const donorDisplayName = isAnonymous ? 'Anonymous Donor' : (currentUser?.full_name || user?.email || 'Rohit Dalal');
    const donorEmailAddress = currentUser?.email || user?.email || 'donor@dtu.ac.in';

    const newRaised = (campaign?.raised || 0) + selectedAmount;

    await supabase
      .from('posts')
      .update({ raised: newRaised })
      .eq('id', campaign?.id);

    const now = new Date();
    const txRecord = {
      id: `tx-${Date.now()}`,
      txId: `CB-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`,
      razorpayId: `UPI-UTR-${utrNumber.trim()}`,
      donorName: donorDisplayName,
      donorEmail: donorEmailAddress,
      studentName: campaign?.studentName || 'Student',
      studentEmail: campaign?.studentEmail || 'student@dtu.ac.in',
      studentCollege: campaign?.college || 'DTU',
      studentUpi: campaign?.upiId || 'Not Provided',
      subjectCode: campaign?.subjectCode || 'Exam Fee',
      campaignTitle: campaign?.title,
      amount: selectedAmount,
      date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      timeAgo: 'Just now'
    };

    const userDonations = JSON.parse(localStorage.getItem('user_donations') || '[]');
    localStorage.setItem('user_donations', JSON.stringify([txRecord, ...userDonations]));

    const globalTx = JSON.parse(localStorage.getItem('global_transactions') || '[]');
    localStorage.setItem('global_transactions', JSON.stringify([txRecord, ...globalTx]));

    const activityItem = {
      id: `act-${Date.now()}`,
      type: 'donation',
      postTitle: campaign?.title,
      postId: campaign?.id,
      timeAgo: 'Just now',
      content: `Donated ₹${selectedAmount} via UPI to ${campaign?.studentName || 'Student'} (${campaign?.college || 'College'})`
    };
    const userActivities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    localStorage.setItem('user_activities', JSON.stringify([activityItem, ...userActivities]));

    try {
      await fetch('/api/send-status-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'donation_receipt_donor',
          email: txRecord.donorEmail,
          donorName: txRecord.donorName,
          studentName: txRecord.studentName,
          studentCollege: txRecord.studentCollege,
          studentUpi: txRecord.studentUpi,
          subjectCode: txRecord.subjectCode,
          amount: txRecord.amount,
          txId: txRecord.txId,
          razorpayId: txRecord.razorpayId,
          date: txRecord.date,
          time: txRecord.time,
        }),
      });

      if (txRecord.studentEmail) {
        await fetch('/api/send-status-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'donation_received_student',
            email: txRecord.studentEmail,
            studentName: txRecord.studentName,
            donorName: txRecord.donorName,
            amount: txRecord.amount,
            note: encouragingNote,
          }),
        });
      }
    } catch (emailErr) {
      console.error('Email receipt dispatch error:', emailErr);
    }

    setIsProcessing(false);
    alert(`Donation Recorded Successfully! UTR Ref: ${utrNumber}. Receipt and email slip generated.`);
    router.push('/profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading Campaign Details...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-28 pb-20 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-4 text-center my-auto space-y-4">
          <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-8 space-y-4">
            <h1 className="text-xl font-bold text-white">Campaign Not Found</h1>
            <p className="text-xs text-slate-400">The requested fee appeal may have been removed or fulfilled.</p>
            <Link href="/feed" className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl">
              Back to Campus Feed
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const goal = campaign.goal || 2000;
  const raised = campaign.raised || 0;
  const remaining = Math.max(0, goal - raised);
  const percentage = Math.min(100, Math.round((raised / goal) * 100));
  const studentName = campaign.studentName || 'Student Beneficiary';
  const firstName = studentName.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 my-auto w-full">
        
        <Link 
          href="/feed?category=funding" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to campaigns
        </Link>

        {/* TOP DIRECT SETTLEMENT BANNER */}
        <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-900/60 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 border border-emerald-700/60">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                100% Direct Student Settlement <span className="text-xs font-normal text-emerald-400">(0% Platform Fee)</span>
              </h3>
              <p className="text-xs text-slate-300">
                Every rupee you donate goes directly into {studentName}&apos;s verified UPI account via direct peer-to-peer transfer.
              </p>
            </div>
          </div>

          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-lg text-xs font-black shrink-0">
            0% Commission
          </span>
        </div>

        {/* TWO COLUMN CAMPAIGN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: APPEAL DETAILS */}
          <div className="lg:col-span-7 bg-[#1C1C1E] border border-slate-800/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-amber-600/30 text-amber-400 font-black text-sm rounded-xl flex items-center justify-center shrink-0 border border-amber-500/30">
                  {studentName.substring(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-extrabold text-white">{studentName}</h1>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Student
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {campaign.college || 'DTU'} {campaign.branch ? `• ${campaign.branch}` : ''} {campaign.year ? `(${campaign.year})` : ''}
                  </p>
                </div>
              </div>

              <span className="inline-block bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1 rounded-lg text-xs">
                ₹{remaining} remaining!
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {campaign.title}
              </h2>
            </div>

            <div className="bg-[#121214] p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-white text-base font-extrabold">
                  ₹{raised} <span className="text-xs font-normal text-slate-400">raised of ₹{goal}</span>
                </span>
                <span className="text-amber-400 font-extrabold text-sm">{percentage}% Funded</span>
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${percentage}%` }} 
                />
              </div>

              <div className="flex justify-between text-xs text-slate-400 font-medium pt-1">
                <span>Direct Peer-to-Peer Transfer</span>
                <span>Active Campaign</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                APPEAL & SITUATION DETAILS
              </h3>
              <div className="bg-[#121214] border border-slate-800/80 rounded-2xl p-5 shadow-inner">
                <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-sans font-medium whitespace-pre-wrap">
                  &ldquo;{campaign.story || 'Please support me in paying my official university re-appear fee.'}&rdquo;
                </p>
              </div>
            </div>

            {/* VERIFIED DIRECT SETTLEMENT DESTINATION (UPI VPA ONLY) */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> VERIFIED DIRECT UPI DESTINATION
              </h3>

              <div className="bg-[#121214] p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">UPI VPA ID</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {campaign.upiId || 'Not Provided'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition"
                >
                  {copied ? 'Copied!' : 'Copy UPI ID'}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-400" /> UPLOADED & VERIFIED DOCUMENTS
              </h3>

              <div className="space-y-2 text-xs">
                <div className="bg-[#121214] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-medium text-slate-200">Official Marks Record / Re-appear Notice</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1 text-[11px]">
                    <Check className="w-3 h-3" /> Checked
                  </span>
                </div>

                <div className="bg-[#121214] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-medium text-slate-200">College ID & Roll Number Verified</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1 text-[11px]">
                    <Check className="w-3 h-3" /> Checked
                  </span>
                </div>

                <div className="bg-[#121214] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="font-medium text-slate-200">Student UPI ID Verified</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 flex items-center gap-1 text-[11px]">
                    <Check className="w-3 h-3" /> Checked
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SEND SUPPORT CARD */}
          <div className="lg:col-span-5 bg-[#1C1C1E] border border-slate-800/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-28">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/30" /> Send Direct Support
              </h3>
              <p className="text-xs text-slate-400">
                0% platform fee. Direct UPI transfer to student.
              </p>
            </div>

            {step === 'amount' ? (
              <form onSubmit={handleProceedToPay} className="space-y-5">
                
                <div className="grid grid-cols-3 gap-2">
                  {[50, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-3 rounded-xl font-bold text-xs border transition ${
                        selectedAmount === amt
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-[#121214] border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                    CUSTOM AMOUNT (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="10"
                      required
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className="w-full bg-[#121214] border border-slate-800 focus:border-blue-500 text-white font-bold text-sm rounded-xl pl-8 pr-4 py-3 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                    ENCOURAGING NOTE (OPTIONAL)
                  </label>
                  <textarea
                    value={encouragingNote}
                    onChange={(e) => setEncouragingNote(e.target.value)}
                    placeholder={`Write a warm note to ${firstName}...`}
                    className="w-full bg-[#121214] border border-slate-800 focus:border-blue-500 text-white text-xs rounded-xl p-3 focus:outline-none resize-none min-h-[90px]"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-[#121214]"
                  />
                  <span>Hide my name on public donor lists</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95"
                >
                  <QrCode className="w-4 h-4" /> Pay ₹{selectedAmount || 0} via UPI
                </button>

                <p className="text-[11px] text-slate-500 text-center font-mono">
                  🔒 Direct UPI P2P Transfer • 0% Fee
                </p>

              </form>
            ) : (
              <form onSubmit={handleVerifyAndSubmit} className="space-y-5">
                
                <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Payment Instructions
                  </h4>
                  <ul className="text-[11px] text-slate-300 space-y-1.5 list-decimal pl-3 leading-relaxed">
                    <li>Pay <strong>₹{selectedAmount}</strong> to the student's UPI ID.</li>
                    <li>Complete the transaction in your UPI App.</li>
                    <li>Copy the <strong>12-digit UTR / Ref Number</strong> from your payment success screen.</li>
                    <li>Paste the number below and click <strong>Verify & Submit</strong>.</li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                    ENTER 12-DIGIT UTR / UPI REF NO. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 435261829012"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full bg-[#121214] border border-slate-800 focus:border-blue-500 text-white font-mono font-bold text-sm rounded-xl px-4 py-3 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Found in your payment app transaction history after successful payment.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('amount')}
                    className="w-1/3 py-3 bg-[#121214] hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-2/3 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isProcessing ? 'Verifying...' : 'Verify & Submit'}
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </main>

      {/* UPI ID / QR PAYMENT MODAL */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative text-center">
            
            <button 
              onClick={() => setShowUpiModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Scan or Pay via UPI ID</h2>
              <p className="text-xs text-slate-400">
                Send <strong className="text-white">₹{selectedAmount}</strong> directly to <strong className="text-white">{studentName}</strong>.
              </p>
            </div>

            {/* UPI ID Copy Box */}
            <div className="bg-[#121214] p-4 rounded-2xl border border-slate-800 space-y-2 text-left">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Student UPI VPA</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-emerald-400 text-sm truncate">
                  {campaign.upiId || 'Not Provided'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Open any UPI app (GPay, PhonePe, Paytm), pay the amount to the UPI ID above, copy the transaction UTR number, and click continue.
            </p>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="w-1/2 py-3 bg-[#121214] hover:bg-slate-800 text-slate-400 font-semibold text-xs rounded-xl border border-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToUtr}
                className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                I Have Paid →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* <Footer /> */}
    </div>
  );
}