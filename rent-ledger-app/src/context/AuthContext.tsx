// Supabase client used for authentication and database queries
import { supabase } from "@/lib/supabase";
// Type describing our application's user_profiles database record
import { UserProfile } from "@/types/auth";
// Supabase types for the login session and authenticated user
import { Session, User } from "@supabase/supabase-js";

/*
createContext → create shared/global context
useContext    → read that context
useEffect     → run code on mount/auth changes
useMemo       → reuse a calculated object until dependencies change
useState      → store changing values
*/
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Defines everything that AuthContext will make available
// to components/screens using useAuth()
type AuthContextValue = {
  session: Session | null; // Current Supabase login session
  user: User | null; // Logged-in Supabase user
  profile: UserProfile | null; // User's record from user_profiles
  loading: boolean; // True while auth operation is running

  // Authentication functions available to screens
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Reload the user's profile from the database
  refreshProfile: () => Promise<void>;
};

// Shared authentication context accessible by components inside AuthProvider, MAY BE UNDEFINED INITIALLY
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Helper function: fetch our application profile
// for a particular authenticated Supabase user.
async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, full_name, phone, role, is_active, created_at")
    .eq("id", userId)
    .single();

  // Return null if profile could not be fetched
  if (error) {
    console.error("Profile fetch error:", error.message);
    return null;
  }

  // Tell TypeScript to treat returned data as UserProfile
  return data as UserProfile;
}

// Provider wraps the app and keeps authentication state
// available to every child screen/component.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Current Supabase login session
  const [session, setSession] = useState<Session | null>(null);

  // Our application's user profile
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Used by UI to know when authentication is being processed
  const [loading, setLoading] = useState(true);

  // Extract user from current session.
  // If no session exists, user will be null.
  // ?? If the value on the left is null or undefined, use null.
  const user = session?.user ?? null;

  // Reload the current user's profile from Supabase
  const refreshProfile = async () => {
    if (!session?.user?.id) {
      setProfile(null);
      return;
    }

    //Retrieve the latest profile from Supabase.
    const userProfile = await fetchProfile(session.user.id);

    // Update React state with latest profile
    setProfile(userProfile);
  };

  //means this effect is set up when this provider mounts i.e [] runs once
  useEffect(() => {
    //The mounted variable, This is a safety flag to avoid updating state after unmount
    let mounted = true;

    // Check whether Supabase already has a saved login session
    const loadInitialSession = async () => {
      setLoading(true);

      //Do I currently have a saved authenticated session?
      // This is important because a user should not normally have to log in again every time the app opens.
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
      }

      // Stop if provider was unmounted while awaiting Supabase
      if (!mounted) return;

      //If Supabase returned a session, store it, Save existing session, or null when logged out
      const currentSession = data.session ?? null;
      setSession(currentSession);

      // If someone is logged in, also load their application profile
      if (currentSession?.user?.id) {
        const userProfile = await fetchProfile(currentSession.user.id);
        if (mounted) setProfile(userProfile);
      }

      // Initial authentication check is complete
      if (mounted) setLoading(false);
    };

    // Actually run the initial-session function
    loadInitialSession();

    // Listen continuously for Supabase login/logout/session changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        // Store new authentication session
        setSession(newSession);

        if (newSession?.user?.id) {
          // When logged in, fetch profile for that user
          const userProfile = await fetchProfile(newSession.user.id);
          setProfile(userProfile);
        } else {
          // If logged out, remove profile from state
          setProfile(null);
        }

        setLoading(false);
      },
    );

    // Cleanup when provider unmounts: prevent state updates
    // and stop listening for Supabase auth events
    // Cleanup when AuthProvider is removed
    return () => {
      // Prevent future async state updates
      mounted = false;
      // Stop listening for Supabase auth events
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign user in using Supabase email/password authentication
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Send credentials to Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(), // Remove accidental spaces
      password,
    });

    // Throw error back to login screen if authentication fails
    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    // Store newly authenticated session
    const currentSession = data.session ?? null;
    setSession(currentSession);

    // Load application profile for authenticated user
    if (currentSession?.user?.id) {
      const userProfile = await fetchProfile(currentSession.user.id);

      // Valid Supabase user must also have an app profile
      if (!userProfile) {
        setLoading(false);
        throw new Error("User profile not found. Please contact admin.");
      }

      // Block users whose profile has been deactivated
      if (!userProfile.is_active) {
        // End their Supabase session
        await supabase.auth.signOut();
        setLoading(false);
        throw new Error("Your account is inactive. Please contact admin.");
      }

      // Store valid application's user profile
      setProfile(userProfile);
    }

    // Login process finished
    setLoading(false);
  };

  // Logout function available to all screens
  const signOut = async () => {
    setLoading(true);

    // End session in Supabase
    await supabase.auth.signOut();

    // Clear local authentication state
    setSession(null);
    setProfile(null);

    setLoading(false);
  };

  // Build the single object exposed through AuthContext.
  // useMemo avoids unnecessarily recreating this object.
  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, user, profile, loading],
  );

  // Make authentication information/functions available
  // to every component placed inside AuthProvider
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook that gives screens easy access to AuthContext.
//
// Example:
// const { user, profile, signIn, signOut } = useAuth();
export function useAuth() {
  // Read the nearest AuthContext.Provider
  const context = useContext(AuthContext);

  // Protect against using this hook outside AuthProvider
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  // Give caller access to auth state and functions
  return context;
}

/*
1. useState
   ↓
Stores session, profile and loading

2. useEffect
   ↓
Checks initial login + listens for login/logout

3. signIn / signOut
   ↓
Talk to Supabase authentication

4. AuthContext.Provider
   ↓
Makes authentication data available throughout app

5. useAuth()
   ↓
Allows any screen to retrieve that authentication data
*/
