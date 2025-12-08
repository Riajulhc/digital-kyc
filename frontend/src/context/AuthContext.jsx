// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null); // <-- important
  const [loading, setLoading] = useState(true);

  // Load saved session
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    const savedUser = localStorage.getItem("user");

    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);
    if (savedUser) setUser(JSON.parse(savedUser));

    setLoading(false); // finished bootstrapping
  }, []);

  // Login handler
  const login = (token, role, userData = {}) => {
    setToken(token);
    setRole(role);
    setUser(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
