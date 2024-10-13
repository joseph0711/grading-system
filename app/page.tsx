"use client";

import { useState, useEffect } from "react";
import TeacherHome from "../components/TeacherHome";
import Login from "../components/login";
import StudentHome from "../components/StudentHome";
import SelectCourse from "../components/select-course";

export default function AuthPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setRole(data.user.role);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (
    account: string,
    password: string,
    rememberMe: boolean
  ) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ account, password, rememberMe }),
    });

    if (res.ok) {
      const sessionRes = await fetch("/api/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated) {
          setIsAuthenticated(true);
          setRole(sessionData.user.role); // Set the role from the session
        }
      } else {
        alert("Failed to retrieve session data after login.");
      }
    } else {
      const data = await res.json();
      alert(data.message || "Login failed! Please check your credentials.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsAuthenticated(false);
    setRole(null);
    setSelectedCourse(null);
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  return (
    <div>
      {isAuthenticated ? (
        selectedCourse ? (
          role === "student" ? (
            <StudentHome onLogout={handleLogout} courseId={selectedCourse} />
          ) : role === "teacher" ? (
            <TeacherHome onLogout={handleLogout} courseId={selectedCourse} />
          ) : (
            <div>Loading...</div>
          )
        ) : (
          <SelectCourse onCourseSelect={handleCourseSelect} onLogout={handleLogout} />
        )
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}