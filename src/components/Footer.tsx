'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ShieldCheck, ShieldAlert, ArrowUpRight, Shield, FileText } from 'lucide-react';
import AdminLoginModal from '@/components/AdminLoginModal';

export default function Footer() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  return (
    <footer className="bg-[#121212] border-t border-slate-800/80 text-slate-300 pt-16 pb-12 px-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* MAIN 4-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 items-start">
          
          {/* COLUMN 1: BRANDING & CONTACT */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black tracking-tight text-white inline-block">
              come<span className="text-blue-500">Back</span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              Delhi's premier student peer-to-peer crowdfunding & mentorship network. Helping engineering students overcome exam fee hurdles with 0% platform commission.
            </p>

            <div className="pt-2">
              <a 
                href="mailto:collegeeasy.official@gmail.com" 
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white transition"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                collegeeasy.official@gmail.com
              </a>
            </div>
          </div>

          {/* COLUMN 2: QUICK NAVIGATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              QUICK NAVIGATION
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:text-white transition inline-flex items-center gap-1">
                  Campus Feed <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Sign In / Register
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: POLICIES & LEGAL */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              POLICIES & LEGAL
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/privacy" className="hover:text-white transition inline-flex items-center gap-1">
                  Privacy Policy <Shield className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition inline-flex items-center gap-1">
                  Terms of Service <FileText className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link href="/payout-policy" className="hover:text-white transition">
                  Refund & Payout Policy
                </Link>
              </li>
              <li>
                <a href="mailto:collegeeasy.official@gmail.com" className="hover:text-white transition">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: 0% COMMISSION BADGE & ADMIN BUTTON */}
          <div className="space-y-4">
            
            {/* 0% COMMISSION CARD */}
            <div className="bg-[#181818] border border-slate-800 rounded-2xl p-4 space-y-2 shadow-xl">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>0% PLATFORM COMMISSION</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                We charge ₹0 in platform fees. 100% of donor payments settle directly into the student's verified bank or UPI account via Razorpay route.
              </p>
            </div>

            {/* BRIGHT PURPLE ADMIN LOGIN BUTTON */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <ShieldAlert className="w-4 h-4" />
              ADMIN LOGIN PORTAL
            </button>

          </div>

        </div>

        {/* BOTTOM COPYRIGHT BAR WITH DEVELOPER LINKEDIN CREDIT */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© 2026 comeBACK Foundation • All Rights Reserved</p>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Website developed and managed by</span>
            <a
              href="https://www.linkedin.com/in/rohit--dalal/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition"
            >
              Rohit Dalal
              <span className="w-4 h-4 bg-amber-500 text-[#121212] rounded flex items-center justify-center p-0.5">
                <svg
                  className="w-3 h-3 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                </svg>
              </span>
            </a>
          </div>
        </div>

      </div>

      {/* ADMIN LOGIN MODAL POPUP */}
      <AdminLoginModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
      />
    </footer>
  );
}