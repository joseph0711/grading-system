"use client";

import { useState, useEffect } from "react";
import TeacherHome from "../components/TeacherHome";
import Login from "../components/login";
import StudentHome from "../components/StudentHome";

export default function AuthPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  // On component mount, check if the user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/session');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true); // Set authenticated if the session is valid
        setRole(data.role);
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
      setRole(data.role);
    } else {
      alert(data.message || "Login failed! Please check your credentials.");
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false); // Clear the authentication state
    setRole(null);
  };

  // Conditional rendering based on authentication and role
  return (
    <div>
      {isAuthenticated ? (
        role === "student" ? (
          <StudentHome onLogout={handleLogout} />
        ) : (
          <TeacherHome onLogout={handleLogout} />
        )
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}