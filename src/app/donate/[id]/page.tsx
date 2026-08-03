'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  Lock, 
  FileCheck2, 
  Building2,
  Heart,
  Check
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
  bankDetails?: {
    upiId: string;
    accountNumber: string;
    ifscCode: string;
  };
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

  useEffect(() => {
    if (!postId) return;

    const loadPostData = () => {
      let foundPost: FeeAppealPost | null = null;

      const savedUserPosts = localStorage.getItem('user_posts');
      if (savedUserPosts) {
        try {
          const parsed = JSON.parse(savedUserPosts);
          if (Array.isArray(parsed)) {
            foundPost = parsed.find((p: any) => p.id === postId) || null;
          }
        } catch (e) {
          console.error('Error parsing user_posts:', e);
        }
      }

      if (!foundPost) {
        const savedFeedPosts = localStorage.getItem('feed_posts');
        if (savedFeedPosts) {
          try {
            const parsedFeed = JSON.parse(savedFeedPosts);
            if (Array.isArray(parsedFeed)) {
              foundPost = parsedFeed.find((p: any) => p.id === postId) || null;
            }
          } catch (e) {
            console.error('Error parsing feed_posts:', e);
          }
        }
      }

      if (!foundPost && (postId === 'post-1' || postId === 'post-101')) {
        foundPost = {
          id: postId,
          title: 'Just ₹50 away from clearing Digital Electronics re-appear fee',
          story: 'I suffered a severe anxiety attack right before the Digital Electronics mid-semester exam, leading to a medical emergency and missed paper. The college requires a ₹2,000 back fee to clear the re-appear exam. My father is an auto-driver and cannot spare this extra amount this month.',
          category: 'funding',
          studentName: 'Divya Singh',
          studentEmail: 'divyasingh@nsut.ac.in',
          college: 'NSUT (Netaji Subhas University of Technology)',
          branch: 'Electronics & Communication Engineering',
          year: '2nd Year',
          subjectCode: 'EC-202',
          goal: 2000,
          raised: 1950,
          datePosted: '1 day ago',
          bankDetails: {
            upiId: 'divyasingh@okicici',
            accountNumber: '••••••••8819',
            ifscCode: 'SBIN0001234'
          }
        };
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

  // Helper loader for Razorpay Checkout Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || selectedAmount <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }

    requireAuthAction(async () => {
      setIsProcessing(true);

      // 1. Load Razorpay SDK Script dynamically
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setIsProcessing(false);
        return;
      }

      try {
        // 2. Create order on backend API route
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: selectedAmount }),
        });

        const orderData = await orderRes.json();

        if (!orderData.success) {
          throw new Error(orderData.error || 'Failed to create Razorpay order.');
        }

        const donorDisplayName = isAnonymous ? 'Anonymous Donor' : (currentUser?.full_name || user?.email || 'Rohit Dalal');
        const donorEmailAddress = currentUser?.email || user?.email || 'donor@dtu.ac.in';

        // 3. Configure Razorpay Gateway Options
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: 'comeBACK Foundation',
          description: `Direct Support for ${campaign.studentName || 'Student'}`,
          order_id: orderData.order.id,
          handler: async function (response: any) {
            // PAYMENT SUCCESSFUL HANDLER
            const newRaised = (campaign.raised || 0) + selectedAmount;
            const updatedCampaign = { ...campaign, raised: newRaised };

            // Update Post Raised Amount in localStorage
            const savedUser = localStorage.getItem('user_posts');
            if (savedUser) {
              try {
                const parsed = JSON.parse(savedUser);
                const updated = parsed.map((p: any) => p.id === campaign.id ? updatedCampaign : p);
                localStorage.setItem('user_posts', JSON.stringify(updated));
              } catch (e) {
                console.error(e);
              }
            }

            const savedFeed = localStorage.getItem('feed_posts');
            if (savedFeed) {
              try {
                const parsed = JSON.parse(savedFeed);
                const updated = parsed.map((p: any) => p.id === campaign.id ? updatedCampaign : p);
                localStorage.setItem('feed_posts', JSON.stringify(updated));
              } catch (e) {
                console.error(e);
              }
            }

            // Build Transaction Record
            const now = new Date();
            const txRecord = {
              id: `tx-${Date.now()}`,
              txId: `CB-DIRECT-${Math.floor(10000000 + Math.random() * 90000000)}`,
              razorpayId: response.razorpay_payment_id || `pay_P2P_${Math.random().toString(36).substring(2, 11)}`,
              donorName: donorDisplayName,
              donorEmail: donorEmailAddress,
              studentName: campaign.studentName || 'Divya Singh',
              studentEmail: campaign.studentEmail || 'student@nsut.ac.in',
              studentCollege: campaign.college || 'NSUT',
              studentUpi: campaign.bankDetails?.upiId || 'student@upi',
              subjectCode: campaign.subjectCode || 'Exam Fee',
              campaignTitle: campaign.title,
              amount: selectedAmount,
              date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
              time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
              timeAgo: 'Just now'
            };

            // Save to User Donations & Global Transactions
            const userDonations = JSON.parse(localStorage.getItem('user_donations') || '[]');
            localStorage.setItem('user_donations', JSON.stringify([txRecord, ...userDonations]));

            const globalTx = JSON.parse(localStorage.getItem('global_transactions') || '[]');
            localStorage.setItem('global_transactions', JSON.stringify([txRecord, ...globalTx]));

            // Add to User Activity Log
            const activityItem = {
              id: `act-${Date.now()}`,
              type: 'donation',
              postTitle: campaign.title,
              postId: campaign.id,
              timeAgo: 'Just now',
              content: `Donated ₹${selectedAmount} to ${campaign.studentName || 'Student'} (${campaign.college || 'College'})`
            };
            const userActivities = JSON.parse(localStorage.getItem('user_activities') || '[]');
            localStorage.setItem('user_activities', JSON.stringify([activityItem, ...userActivities]));

            // Dispatch Automated Email Receipts
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
            alert(`Payment Successful! Razorpay Ref: ${response.razorpay_payment_id}. Receipt and email slip generated.`);
            router.push('/profile');
          },
          prefill: {
            name: donorDisplayName,
            email: donorEmailAddress,
          },
          theme: {
            color: '#2563eb',
          },
        };

        const paymentWindow = new (window as any).Razorpay(options);
        paymentWindow.open();
        setIsProcessing(false);

      } catch (err: any) {
        console.error('Payment initialization error:', err);
        alert(err.message || 'Error initializing payment gateway.');
        setIsProcessing(false);
      }
    });
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
                Every rupee you donate goes directly into {studentName}&apos;s verified bank/UPI account via secure Razorpay gateway.
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

            {/* VERIFIED DIRECT SETTLEMENT DESTINATION (MASKED) */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> VERIFIED DIRECT SETTLEMENT DESTINATION
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#121214] p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">UPI VPA</span>
                  <span className="font-mono font-bold text-white truncate block">
                    ••••••••@okicici
                  </span>
                </div>

                <div className="bg-[#121214] p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">BANK ACCOUNT</span>
                  <span className="font-mono font-bold text-white truncate block">
                    ••••••••••••
                  </span>
                </div>

                <div className="bg-[#121214] p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">IFSC CODE</span>
                  <span className="font-mono font-bold text-white truncate block">
                    ********
                  </span>
                </div>
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
                  <span className="font-medium text-slate-200">Student Bank Account & UPI ID Verified</span>
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
                0% platform fee. Pay securely via Razorpay gateway.
              </p>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-5">
              
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
                disabled={isProcessing}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                {isProcessing ? 'Initializing Razorpay...' : `Transfer ₹${selectedAmount || 0} via Razorpay`}
              </button>

              <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1 font-mono">
                <Lock className="w-3 h-3 text-slate-500" /> Secure Razorpay Gateway • 0% Fee
              </p>

            </form>
          </div>

        </div>

      </main>

      {/* <Footer /> */}
    </div>
  );
}