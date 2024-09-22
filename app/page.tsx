"use client";

import { useState, useEffect } from "react";
import HomePage from "../components/home";
import Login from "../components/login";

export default function AuthPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On component mount, check if the user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/session');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true); // Set authenticated if the session is valid
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (account: string, password: string, rememberMe: boolean) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ account: account, password, rememberMe })
    });

    const data = await res.json();
    
    if (res.ok) {
      setIsAuthenticated(true);
    } else {
      alert(data.message || "Login failed! Please check your credentials.");
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false); // Clear the authentication state
  };

  return (
    <div>
      {isAuthenticated ? (
        <HomePage onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}