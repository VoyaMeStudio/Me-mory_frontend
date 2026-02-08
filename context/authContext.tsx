import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  isAuthed: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);

  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    setIsAuthed(!!token);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    setIsAuthed(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = useMemo(() => ({ isAuthed, checkAuth, logout }), [isAuthed]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
