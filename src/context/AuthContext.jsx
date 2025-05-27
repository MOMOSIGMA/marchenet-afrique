import { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../api"; // Utilise api.js

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isVendor, setIsVendor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/check");
        if (res.data.user) {
          setUser(res.data.user);
          setAuthToken(localStorage.getItem("authToken")); // Ajoute le token pour les requêtes suivantes
          const vendorRes = await api.get("/vendors/me");
          setIsVendor(!!vendorRes.data);
        } else {
          setUser(null);
          setIsVendor(false);
        }
      } catch {
        setUser(null);
        setIsVendor(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("authToken", res.data.token);
    setAuthToken(res.data.token); // Ajoute le token dans axios
    setUser(res.data.user);
    const vendorRes = await api.get("/vendors/me");
    setIsVendor(!!vendorRes.data);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("authToken");
    setAuthToken(null); // Retire le token
    setUser(null);
    setIsVendor(false);
  };

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    localStorage.setItem("authToken", res.data.token);
    setAuthToken(res.data.token); // Ajoute le token dans axios
    setUser(res.data.user);
    setIsVendor(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isVendor,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}