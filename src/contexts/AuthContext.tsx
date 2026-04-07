import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'doctor' | 'patient' | 'pharmacy';

/** Returns the correct dashboard path for a given role. */
export function getDashboardPath(role: string | null | undefined): string {
  if (role === 'doctor')   return '/doctor-dashboard';
  if (role === 'pharmacy') return '/pharmacy-dashboard';
  return '/patient-dashboard';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; role?: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole]       = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Defer to avoid Supabase deadlock
          setTimeout(() => { fetchAndSetRole(session.user.id); }, 0);
        } else {
          setRole(null);
        }
      }
    );

    // Then hydrate existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchAndSetRole(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Fetches role from profiles and stores it in state. Returns the role string. */
  const fetchAndSetRole = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      const r = (data?.role ?? 'patient') as UserRole;
      setRole(r);
      return r;
    } catch {
      setRole('patient');
      return 'patient';
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/email-confirmado`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName, role },
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  /**
   * Signs the user in.
   * Returns `{ error }` on failure or `{ error: null, role }` on success.
   * The caller is responsible for navigating to getDashboardPath(role).
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error, role: null };
      const r = data.user ? await fetchAndSetRole(data.user.id) : null;
      return { error: null, role: r };
    } catch (error) {
      return { error, role: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
