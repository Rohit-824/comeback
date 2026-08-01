'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface StudentRegisterData {
  role: 'student';
  fullName: string;
  email: string;
  password: string;
  college: string;
  branch: string;
  year: string;
  rollNumber: string;
}

export interface DonorRegisterData {
  role: 'donor';
  fullName: string;
  email: string;
  password: string;
  occupation: string;
}

export type RegisterData = StudentRegisterData | DonorRegisterData;

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  currentUser: Profile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  registerUser: (data: RegisterData) => Promise<AuthResult>;
  loginUser: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      return data as Profile;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const profile = await fetchProfile(session.user.id);
        setCurrentUser(profile);
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          setCurrentUser(profile);
        } else {
          setUser(null);
          setCurrentUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const registerUser = async (data: RegisterData): Promise<AuthResult> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Registration failed.');

      const profilePayload: Partial<Profile> = {
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        role: data.role,
        is_admin: false,
        member_since: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      };

      if (data.role === 'student') {
        profilePayload.college = data.college;
        profilePayload.branch = data.branch;
        profilePayload.year = data.year;
        profilePayload.roll_number = data.rollNumber;
      } else {
        profilePayload.occupation = data.occupation;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });

      if (profileError) throw new Error(profileError.message);

      fetch('/api/send-status-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          college: data.role === 'student' ? data.college : undefined,
          occupation: data.role === 'donor' ? data.occupation : undefined,
        }),
      }).catch((err) => console.error('Failed to send welcome email:', err));

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const loginUser = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, message: error.message };

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        setCurrentUser(profile);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentUser(null);
  };

  const userEmail = currentUser?.email?.toLowerCase() || user?.email?.toLowerCase() || '';
  const isAdmin =
    currentUser?.is_admin === true ||
    currentUser?.role === 'admin' ||
    userEmail === 'collegeeasy.official@gmail.com' ||
    userEmail === 'dalalrohit824@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser,
        isLoggedIn: !!user,
        isLoading,
        isAdmin,
        registerUser,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}