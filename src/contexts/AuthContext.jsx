import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, authService, profilesService } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'info@brighteninglighting.com').toLowerCase();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initializeRef = useRef(false);

  // Initialize auth state from stored Supabase session on mount
  useEffect(() => {
    if (initializeRef.current) return;
    initializeRef.current = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          sessionStorage.setItem('brighten_admin_email', session.user.email?.toLowerCase() || '');
          
          // Try to load profile
          try {
            const p = await profilesService.getByUserId(session.user.id);
            setProfile(p);
          } catch (e) {
            // Profile table may not exist, set fallback for admin email
            if (session.user.email?.toLowerCase() === adminEmail) {
              setProfile({ id: session.user.id, email: session.user.email, role: 'admin' });
            }
          }
        }
      } catch (err) {
        console.error('Failed to check session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signin = async (identifier, password) => {
    try {
      setLoading(true);
      setError(null);
      // Allow login with username or email
      const trimmedIdentifier = identifier.trim();
      let emailToUse = trimmedIdentifier;
      const normalizedIdentifier = trimmedIdentifier.toLowerCase();
      
      // If it's not an email, try to look up the email by username
      if (!trimmedIdentifier.includes('@')) {
        const adminLocalPart = adminEmail.split('@')[0];

        // Fallback for local admin usernames when profiles table is not set up yet.
        if (normalizedIdentifier === adminLocalPart || normalizedIdentifier === 'admin' || normalizedIdentifier === 'admin_info') {
          emailToUse = adminEmail;
        } else {
          try {
            const profileByUsername = await profilesService.getByUsername(normalizedIdentifier);
            if (!profileByUsername?.email) throw new Error('No account found for that username');
            emailToUse = profileByUsername.email;
          } catch (err) {
            throw new Error('Invalid login. Use your admin email and password.');
          }
        }
      }

      // Sign in with Supabase
      const { session, user: authUser } = await authService.signin(emailToUse, password);
      const activeUser = session?.user || authUser;

      if (!activeUser) {
        throw new Error('Login succeeded but Supabase did not return a user session. Check whether the user is confirmed in Supabase Auth.');
      }

      // Set user in context
      setUser(activeUser);
      sessionStorage.setItem('brighten_admin_email', activeUser.email?.toLowerCase() || '');
      
      // Try to load profile, but don't fail if it doesn't exist
      let loadedProfile = null;
      try {
        loadedProfile = await profilesService.getByUserId(activeUser.id);
      } catch (e) {
        // Profile table might not exist - that's OK, we'll use email fallback
      }
      
      // Set profile: either from database or fallback to admin email check
      if (loadedProfile) {
        setProfile(loadedProfile);
      } else if (activeUser.email?.toLowerCase() === adminEmail) {
        setProfile({ id: activeUser.id, email: activeUser.email, role: 'admin' });
      } else {
        setProfile({ id: activeUser.id, email: activeUser.email, role: 'customer' });
      }
      
      toast.success('Logged in successfully');
      return activeUser;
    } catch (err) {
      const errorMsg = err.message || 'Failed to sign in';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ username, email, password, role = 'customer' }) => {
    try {
      setLoading(true);
      setError(null);
      const normalizedUsername = (username?.trim() || email.split('@')[0]).toLowerCase();
      const res = await authService.signup(email, password);
      const newUser = res?.user || res?.data?.user || null;
      if (!newUser) throw new Error('Failed to create user');

      // create profile row
      await profilesService.createProfile({ id: newUser.id, username: normalizedUsername, email, role });

      setUser(newUser);
      const p = await profilesService.getByUserId(newUser.id);
      setProfile(p);
      toast.success('Account created successfully');
      return newUser;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signout();
      setUser(null);
      setProfile(null);
      sessionStorage.removeItem('brighten_admin_email');
      toast.success('Logged out successfully');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await authService.resetPassword(email);
      toast.success('Password reset email sent');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signin,
    signup,
    signout,
    resetPassword,
    isAdmin: profile?.role === 'admin' || user?.email?.toLowerCase() === adminEmail || sessionStorage.getItem('brighten_admin_email') === adminEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
