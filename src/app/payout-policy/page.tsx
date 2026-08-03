'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PayoutPolicyPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 space-y-8 w-full my-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-[#1E1E1E] rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-emerald-950 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Refund & Payout Policy</h1>
              <p className="text-xs text-slate-400">Last updated: August 2026 • comeBACK Foundation</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h3 className="font-bold text-white text-base pt-2">1. Direct P2P Settlement Payouts</h3>
            <p>
              All donations made toward student fee appeals are processed as direct peer-to-peer transfers. Funds are immediately earmarked for the student beneficiary's verified bank or UPI account upon successful gateway confirmation.
            </p>

            <h3 className="font-bold text-white text-base pt-2">2. Refund & Cancellation Policy</h3>
            <p>
              Because contributions are directly transferred to student beneficiaries to clear urgent re-appear deadlines, all donations are final and non-refundable once processed. If an appeal is flagged or found to be in violation of our integrity guidelines prior to full funding, alternative disbursement or credit protocols are evaluated on a case-by-case basis by the platform admin.
            </p>

            <h3 className="font-bold text-white text-base pt-2">3. Digital Payment Slips</h3>
            <p>
              Donors receive an official digital payment slip with a unique receipt ID and gateway reference immediately upon completing a transaction. These can be downloaded or printed directly from the user's profile transaction history.
            </p>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}