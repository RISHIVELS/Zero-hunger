import { createContext, useContext, useState, useEffect } from "react";
import { supabase, getCurrentUser, signOut } from "../services/supabase";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user on mount
    const getUserInfo = async () => {
      try {
        const { data, error } = await getCurrentUser();
        if (error) throw error;

        if (data.user) {
          setUser(data.user);
          setUserRole(data.user.user_metadata?.role || null);
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          setUserRole(session.user.user_metadata?.role || null);
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) throw error;
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userRole,
    isAcceptor: userRole === "acceptor",
    isDonor: userRole === "donor",
    isWarehouse: userRole === "warehouse",
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
