'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 space-y-8 w-full my-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-[#1E1E1E] rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-purple-950 text-purple-400 rounded-xl flex items-center justify-center border border-purple-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Terms of Service</h1>
              <p className="text-xs text-slate-400">Last updated: August 2026 • comeBACK Foundation</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h3 className="font-bold text-white text-base pt-2">1. Acceptance of Terms</h3>
            <p>
              By accessing and using comeBACK, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please refrain from using the platform.
            </p>

            <h3 className="font-bold text-white text-base pt-2">2. Student Appeal Integrity</h3>
            <p>
              Students submitting re-appear fee funding appeals warrant that all uploaded university notices, mark sheets, and student IDs are authentic and accurate. Fraudulent or falsified appeals will result in immediate account termination and permanent bans from the Delhi Engineering Peer Support Network.
            </p>

            <h3 className="font-bold text-white text-base pt-2">3. 0% Platform Commission Policy</h3>
            <p>
              comeBACK charges ₹0 in platform service fees. 100% of funds contributed by donors are routed directly to the verified student beneficiaries.
            </p>

            <h3 className="font-bold text-white text-base pt-2">4. User Conduct</h3>
            <p>
              Users participating in campus discussions or comment threads agree to maintain civil discourse. Harassment, hate speech, spam, or malicious behavior will be flagged and removed by administrators.
            </p>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}