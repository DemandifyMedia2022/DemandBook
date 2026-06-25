"use client";

import { useState, useEffect } from "react";
import { UserProfile, getClientUser, getClientToken, clearClientSession } from "../lib/auth";
import { Permission, hasPermission } from "../lib/permissions";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const activeUser = getClientUser();
    const activeToken = getClientToken();
    setUser(activeUser);
    setToken(activeToken);
    setLoading(false);
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:8888/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (e) {
      console.warn("Logout request failed, clearing local session.");
    } finally {
      clearClientSession();
      setUser(null);
      setToken(null);
      setLoading(false);
      window.location.href = "/login";
    }
  };

  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(user, permission);
  };

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    logout,
    checkPermission,
    isSuperAdmin: user?.role === "SUPER_ADMIN",
    isAdmin: user?.role === "ADMIN"
  };
}
