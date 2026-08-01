'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Heart, 
  CreditCard,
  Building2,
  FileText,
  Sparkles,
  Printer,
  X,
  UserCheck
} from 'lucide-react';

export default function DonatePage({ params }: { params: { id: string } }) {
  const { requireAuthAction, currentUser } = useAuth();

  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('50');
  const [encouragingNote, setEncouragingNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<any | null>(null);

  // Quick Preset Selection
  const handlePresetSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  // Custom Input Handler
  const handleCustomInput = (val: string) => {
    setCustomAmount(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedAmount(parsed);
    }
  };

  // Payment Execution (Triggers Receipt Slip Modal)
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuthAction(() => {
      const now = new Date();
      const generatedReceipt = {
        receiptId: `CB-DIRECT-${Math.floor(10000000 + Math.random() * 90000000)}`,
        gatewayRef: `pay_direct_${Math.random().toString(36).substring(2, 11)}`,
        date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        donorName: isAnonymous ? 'Anonymous Donor' : (currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Rohit Dalal'),
        studentName: 'Divya Singh',
        college: 'NSUT (Netaji Subhas University of Technology)',
        upiId: 'divyasingh@okicici',
        amount: selectedAmount,
        subjectCode: 'EC-202'
      };

      setReceiptDetails(generatedReceipt);
      setShowReceipt(true);
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* BACK BUTTON */}
        <Link 
          href="/#posts" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          ← Back to campaigns
        </Link>

        {/* 100% DIRECT SETTLEMENT TOP BANNER */}
        <div className="bg-[#0D2818] border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                100% Direct Student Settlement <span className="text-emerald-400 font-normal text-xs">(0% Platform Fee)</span>
              </h3>
              <p className="text-xs text-slate-300">
                Every rupee you donate goes directly into Divya Singh's verified bank/UPI account.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block bg-emerald-950 text-emerald-400 border border-emerald-700/80 text-xs font-extrabold px-3 py-1 rounded-lg">
            0% Commission
          </span>
        </div>

        {/* SUCCESS SETTLEMENT BANNER (WHEN RECEIPT IS ACTIVE) */}
        {showReceipt && (
          <div className="bg-[#121E17] border border-emerald-500/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-extrabold text-white text-sm sm:text-base">Direct Transfer Settlement Completed!</h4>
                <p className="text-xs text-slate-300">100% of your contribution (₹{receiptDetails?.amount}) was transferred directly to Divya Singh.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={() => window.print()}
                className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <Printer className="w-4 h-4" /> Print PDF Receipt
              </button>
              <Link 
                href="/profile"
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#1E1E1E] hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition text-center"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* TWO-COLUMN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: CAMPAIGN DETAILS & VERIFIED PROOFS (2 SPANS) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8 shadow-2xl">
              
              {/* STUDENT PROFILE HEADER */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/20 text-amber-400 font-extrabold text-lg rounded-2xl flex items-center justify-center border border-amber-500/30">
                      DS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg font-extrabold text-white">Divya Singh</h1>
                        <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Student
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        NSUT (Netaji Subhas University of Technology) • Electronics & Communication Engineering (2nd Year)
                      </p>
                    </div>
                  </div>

                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-extrabold px-3 py-1 rounded-lg">
                    ₹50 remaining!
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
                  Just ₹50 away from clearing Digital Electronics re-appear fee
                </h2>

                {/* PROGRESS BAR PANEL */}
                <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-baseline text-xs sm:text-sm">
                    <span className="font-extrabold text-white">
                      ₹1950 <span className="font-normal text-slate-400 text-xs">raised of ₹2000</span>
                    </span>
                    <span className="text-amber-400 font-extrabold">98% Funded</span>
                  </div>

                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[98%] transition-all duration-500" />
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1 font-medium">
                    <span>61 Supporters Backed</span>
                    <span>3 Days Remaining</span>
                  </div>
                </div>
              </div>

              {/* APPEAL DETAILS SECTION */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  APPEAL & SITUATION DETAILS
                </h3>
                <div className="bg-[#121212] p-5 rounded-2xl border border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans italic">
                  "I suffered a severe anxiety attack right before the Digital Electronics mid-semester exam, leading to a medical emergency and missed paper. The college requires a ₹2,000 back fee to clear the re-appear exam. My father is an auto-driver and cannot spare this extra amount this month. I have uploaded my official hospital certificate and university marksheet slip below for full transparency."
                </div>
              </div>

              {/* VERIFIED DIRECT SETTLEMENT DESTINATION */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> VERIFIED DIRECT SETTLEMENT DESTINATION
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#121212] p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 uppercase font-bold text-[10px] block">UPI VPA</span>
                    <span className="font-mono font-bold text-slate-200">divyasingh@okicici</span>
                  </div>
                  <div className="bg-[#121212] p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 uppercase font-bold text-[10px] block">BANK ACCOUNT</span>
                    <span className="font-mono font-bold text-slate-200">••••••••8819</span>
                  </div>
                  <div className="bg-[#121212] p-3.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 uppercase font-bold text-[10px] block">IFSC CODE</span>
                    <span className="font-mono font-bold text-slate-200">SBIN0001234</span>
                  </div>
                </div>
              </div>

              {/* UPLOADED & VERIFIED DOCUMENTS */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> UPLOADED & VERIFIED DOCUMENTS
                </h3>
                <div className="space-y-2">
                  {[
                    'Official Marks Record (EC-202 Re-appear Notice)',
                    'Hospital Emergency Slip (Medically Documented)',
                    'College ID & Roll Number Verified',
                    'Student Bank Account & UPI ID Verified'
                  ].map((docName, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#121212] p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-300 hover:border-slate-700 transition"
                    >
                      <span className="flex items-center gap-2.5 font-medium">
                        <FileText className="w-4 h-4 text-slate-400" /> {docName}
                      </span>
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Checked
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: SEND DIRECT SUPPORT CARD (STICKY) */}
          <div className="lg:col-span-1 lg:sticky lg:top-28">
            <div className="bg-[#1E1E1E] rounded-3xl p-6 border border-slate-800 space-y-6 shadow-2xl">
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Send Direct Support
                </h3>
                <p className="text-xs text-slate-400">
                  0% platform fee. 100% goes directly to Divya Singh.
                </p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                
                {/* PRESET AMOUNT BUTTONS */}
                <div className="grid grid-cols-3 gap-2">
                  {[50, 250, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePresetSelect(amt)}
                      className={`py-3 rounded-xl text-xs font-black transition border ${
                        selectedAmount === amt
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-[#121212] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                {/* CUSTOM AMOUNT INPUT */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Custom Amount (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                    <input 
                      type="number"
                      min="1"
                      value={customAmount}
                      onChange={(e) => handleCustomInput(e.target.value)}
                      className="w-full bg-[#121212] border border-slate-800 text-white font-extrabold rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* ENCOURAGING NOTE */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Encouraging Note (Optional)
                  </label>
                  <textarea 
                    value={encouragingNote}
                    onChange={(e) => setEncouragingNote(e.target.value)}
                    placeholder="Write a warm note to Divya..."
                    className="w-full bg-[#121212] border border-slate-800 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 resize-none min-h-[80px]"
                  />
                </div>

                {/* ANONYMOUS CHECKBOX */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 font-medium">
                  <input 
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded bg-[#121212] border-slate-800 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <span>Hide my name on public donor lists</span>
                </label>

                {/* SUBMIT RAZORPAY BUTTON */}
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95"
                >
                  <CreditCard className="w-4 h-4" /> Transfer ₹{selectedAmount} via Razorpay
                </button>

                <p className="text-[10px] text-slate-500 text-center font-medium flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Direct Razorpay Settlement • 0% Fee
                </p>

              </form>

            </div>
          </div>

        </div>

      </main>

      {/* FULL DIRECT PAYMENT SLIP RECEIPT MODAL (MATCHING SCREENSHOT) */}
      {showReceipt && receiptDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 max-w-2xl w-full space-y-6 shadow-2xl relative my-8 font-sans print:p-0 print:shadow-none print:border-none">
            
            <button 
              onClick={() => setShowReceipt(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-1.5 rounded-lg print:hidden transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* HEADER */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div className="space-y-1">
                <div className="text-3xl font-black tracking-tight text-slate-900">
                  come<span className="text-blue-600">Back</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Direct Peer-to-Peer Student Support Network
                </p>
                <p className="text-[11px] text-slate-400">
                  collegeeasy.official@gmail.com • 0% Platform Commission
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
                  DIRECT PAYMENT SLIP
                </span>
                <p className="text-[11px] font-mono text-slate-500 pt-1">
                  Receipt ID: {receiptDetails.receiptId}
                </p>
              </div>
            </div>

            {/* METADATA GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold uppercase text-[10px]">DATE</span>
                <span className="font-extrabold text-slate-800">{receiptDetails.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase text-[10px]">TIME</span>
                <span className="font-extrabold text-slate-800">{receiptDetails.time}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase text-[10px]">GATEWAY REF</span>
                <span className="font-mono text-slate-800 text-[11px] truncate block">{receiptDetails.gatewayRef}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase text-[10px]">PAYOUT FEE</span>
                <span className="font-extrabold text-emerald-600">₹0.00 (0% Fee)</span>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider border-b pb-1.5 mb-2">
                  DONOR DETAILS
                </h4>
                <p><span className="font-semibold text-slate-700">Name:</span> {receiptDetails.donorName}</p>
                <p><span className="font-semibold text-slate-700">Payment Route:</span> Direct Razorpay UPI/Card</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <h4 className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider border-b pb-1.5 mb-2">
                  DIRECT STUDENT BENEFICIARY
                </h4>
                <p><span className="font-semibold text-slate-700">Student:</span> {receiptDetails.studentName}</p>
                <p><span className="font-semibold text-slate-700">College:</span> {receiptDetails.college}</p>
                <p><span className="font-semibold text-slate-700">Student UPI/VPA:</span> <span className="font-mono">{receiptDetails.upiId}</span></p>
              </div>
            </div>

            {/* ITEMIZED BILL TABLE */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2">DESCRIPTION</th>
                  <th className="py-2 text-right">AMOUNT (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 font-medium text-slate-800">
                    Direct Exam Re-Appear Fee Contribution ({receiptDetails.subjectCode})
                  </td>
                  <td className="py-3 text-right font-extrabold text-slate-900">₹{receiptDetails.amount}.00</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-400 italic">
                    comeBACK Platform Fee
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-600">₹0.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900">
                  <td className="py-3 font-black text-sm text-slate-900">Total Direct Transfer to Student</td>
                  <td className="py-3 text-right font-black text-lg text-blue-600">₹{receiptDetails.amount}.00</td>
                </tr>
              </tfoot>
            </table>

            {/* FOOTER & STAMP */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-500 text-emerald-600 flex flex-col items-center justify-center font-black text-[8px] uppercase tracking-tighter leading-none p-1">
                  <span>100% DIRECT</span>
                  <span className="text-[6px] font-normal text-slate-500 pt-0.5">P2P SETTLEMENT</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-extrabold text-slate-900">{receiptDetails.donorName}</p>
                <p className="text-[10px] text-slate-400">Platform Manager • comeBACK</p>
              </div>
            </div>

            {/* ACTION BAR */}
            <div className="pt-2 flex items-center justify-between text-xs print:hidden">
              <button 
                onClick={() => window.print()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print / Download PDF Receipt
              </button>
              <button 
                onClick={() => setShowReceipt(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}