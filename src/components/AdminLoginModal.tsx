'use client';

import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ isOpen, onClose }: Props) {
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const cleanEmail = adminEmail.trim().toLowerCase();

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError) {
        setError(authError.message || 'Invalid Admin Email or Password.');
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        if (
          cleanEmail === 'collegeeasy.official@gmail.com' ||
          cleanEmail === 'dalalrohit824@gmail.com'
        ) {
          onClose();
          window.location.href = '/admin';
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const isUserAdmin = profile?.is_admin === true || profile?.role === 'admin';

        if (isUserAdmin) {
          onClose();
          window.location.href = '/admin';
        } else {
          setError('Access Denied: This account does not have Admin privileges.');
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#1E1E1E] border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-purple-950 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-800/80">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Admin System Access</h2>
          <p className="text-xs text-slate-400">Enter Admin Email & Password</p>
        </div>

        {error && (
          <div className="bg-rose-950/90 border border-rose-800 p-3 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminAuth} className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Admin Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="collegeeasy.official@gmail.com"
                className="w-full bg-[#121212] border border-slate-800 focus:border-purple-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#121212] border border-slate-800 focus:border-purple-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Access Admin Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}