'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth, StudentRegisterData, DonorRegisterData } from '@/context/AuthContext';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Briefcase,
  Building2,
  Hash,
  CalendarDays,
  ArrowRight,
  AlertCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';

type Mode = 'signin' | 'register';
type RegisterRole = 'student' | 'donor';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, registerUser } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [registerRole, setRegisterRole] = useState<RegisterRole>('student');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Shared register fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student-only fields
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [rollNumber, setRollNumber] = useState('');

  // Donor-only field
  const [occupation, setOccupation] = useState('');

  const resetFormFields = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setCollege('');
    setBranch('');
    setYear('');
    setRollNumber('');
    setOccupation('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await loginUser(signInEmail.trim().toLowerCase(), signInPassword);

    if (!result.success) {
      setError(result.message || 'Invalid email or password.');
      setIsSubmitting(false);
      return;
    }

    router.push('/profile');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const data: StudentRegisterData | DonorRegisterData =
      registerRole === 'student'
        ? {
            role: 'student',
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
            college: college.trim(),
            branch: branch.trim(),
            year: year.trim(),
            rollNumber: rollNumber.trim(),
          }
        : {
            role: 'donor',
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
            occupation: occupation.trim(),
          };

    const result = await registerUser(data);

    if (!result.success) {
      setError(result.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    resetFormFields();
    router.push('/profile');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-slate-100 font-sans pt-24 pb-20 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-md mx-auto px-6 w-full my-auto">
        <div className="bg-[#1E1E1E] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-blue-950 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-800/80">
              {mode === 'signin' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? 'Sign in to your comeBACK account'
                : 'Join as a student seeking support or a donor giving support'}
            </p>
          </div>

          {/* MODE TABS */}
          <div className="grid grid-cols-2 gap-2 bg-[#121212] p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${
                mode === 'signin' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${
                mode === 'register' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-rose-950/90 border border-rose-800 p-3 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
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
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 text-xs sm:text-sm">
              {/* ROLE TOGGLE */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterRole('student')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                    registerRole === 'student'
                      ? 'bg-blue-950 border-blue-700 text-blue-300'
                      : 'bg-[#121212] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> Student
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterRole('donor')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                    registerRole === 'donor'
                      ? 'bg-amber-950 border-amber-700 text-amber-300'
                      : 'bg-[#121212] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Donor
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={registerRole === 'student' ? 'you@college.edu' : 'you@example.com'}
                    className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
                  />
                </div>
              </div>

              {registerRole === 'student' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">College *</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. Delhi Technological University"
                        className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Branch *</label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          placeholder="e.g. ECE"
                          className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-3 py-3 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Year *</label>
                      <div className="relative">
                        <CalendarDays className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          placeholder="e.g. 2nd Year"
                          className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-3 py-3 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">College Roll Number *</label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="Your college roll number"
                        className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Occupation *</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-[#121212] border border-slate-800 focus:border-blue-500 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Creating Account...' : `Create ${registerRole === 'student' ? 'Student' : 'Donor'} Account`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-center text-[11px] text-slate-500">
            {mode === 'signin' ? (
              <>Don't have an account? <button onClick={() => switchMode('register')} className="text-blue-400 font-bold hover:underline">Register here</button></>
            ) : (
              <>Already have an account? <button onClick={() => switchMode('signin')} className="text-blue-400 font-bold hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
