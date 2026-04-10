import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  isAuthed: boolean;
  isReady: boolean;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      console.log("[Auth] access_token =", token);

      const authed = !!token;
      setIsAuthed(authed);
      return authed;
    } catch (error) {
      console.error("checkAuth error:", error);
      setIsAuthed(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
    } catch (error) {
      console.error("logout error:", error);
    } finally {
      setIsAuthed(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuth();
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  const value = useMemo(
    () => ({ isAuthed, isReady, checkAuth, logout }),
    [isAuthed, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}