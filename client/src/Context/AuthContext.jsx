import React, { useState, useEffect, createContext } from "react";
import Api from "../Services/Api";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await Api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);

      const res = await Api.post("/users/login", { email, password });
      console.log(res)

      const token = res.data; // backend returns raw token
      localStorage.setItem("token", token);

      await fetchUser();

      return true;
    } catch (err) {
      setError(err.response?.data?.msg || "login failed");
      return false;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setError(null);

      const res = await Api.post("/users/register", {
        name,
        email,
        password,
        role,
      });

      const token = res.data; // backend returns raw token
      localStorage.setItem("token", token);

      await fetchUser();

      return true;
    } catch (err) {
      setError(err.response?.data?.msg || "register failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, logout, login, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
