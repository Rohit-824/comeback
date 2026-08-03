'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 space-y-8 w-full my-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-[#1E1E1E] rounded-3xl p-8 sm:p-10 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 bg-blue-950 text-blue-400 rounded-xl flex items-center justify-center border border-blue-800">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
              <p className="text-xs text-slate-400">Last updated: August 2026 • comeBACK Foundation</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h3 className="font-bold text-white text-base pt-2">1. Information We Collect</h3>
            <p>
              When you register on comeBACK, we collect essential profile details such as your full name, university email address, college name (e.g. DTU, NSUT, IGDTUW), and academic branch to verify your student status. For fee appeals, we collect encrypted academic proofs, re-appear notices, and student ID cards for admin moderation.
            </p>

            <h3 className="font-bold text-white text-base pt-2">2. Secure Direct P2P Transactions</h3>
            <p>
              comeBACK operates on a 0% platform commission model. Payments are processed securely via Razorpay. We do not store sensitive credit card or net banking credentials on our local servers. Transaction logs and payment slips are generated solely to provide official digital receipts to both donors and students.
            </p>

            <h3 className="font-bold text-white text-base pt-2">3. Data Protection & Confidentiality</h3>
            <p>
              Uploaded academic documents and financial destination details are strictly restricted to authorized platform administrators for verification purposes. We do not sell, trade, or rent user personal data to third-party entities.
            </p>

            <h3 className="font-bold text-white text-base pt-2">4. Contact Us</h3>
            <p>
              If you have any questions regarding this Privacy Policy, you can reach out directly via email at <a href="mailto:collegeeasy.official@gmail.com" className="text-blue-400 font-bold hover:underline">collegeeasy.official@gmail.com</a>.
            </p>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}