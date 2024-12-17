"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Login from "./(auth)/login/page";
import { usePageTitle } from "./hooks/usePageTitle";

export default function LoginPage() {
  usePageTitle("loginPage");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loginStatus, setLoginStatus] = useState<{
    message: string;
    type: "error" | "warning" | "info" | null;
    attemptsLeft?: number;
    remainingTime?: number;
  }>({ message: "", type: null });

  // Add session check on page load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();

        if (response.ok && data.authenticated) {
          router.push("/select-course");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (
    account: string,
    password: string,
    rememberMe: boolean
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account, password, rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
        setLoginStatus({ message: "", type: null });
        router.push("/select-course");
      } else if (res.status === 423) {
        setLoginStatus({
          message: `Account is locked. Please try again in ${data.remainingTime} minutes.`,
          type: "error",
          remainingTime: data.remainingTime,
        });
      } else if (res.status === 401) {
        setLoginStatus({
          message: `Invalid credentials. ${data.attemptsLeft} attempts remaining before account lockout.`,
          type: "warning",
          attemptsLeft: data.attemptsLeft,
        });
      } else {
        setLoginStatus({
          message: data.message || "Login failed!",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginStatus({
        message: "An error occurred during login",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-gray-700"></div>
          {/* Inner spinning ring */}
          <div className="absolute top-0 left-0 w-12 h-12">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 dark:border-blue-400 border-t-transparent animate-spin-slow"></div>
          </div>
        </div>
        <div className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
          <span className="inline-block animate-pulse-loading">Loading</span>
          <span className="inline-block animate-pulse-loading delay-200">
            &nbsp;.
          </span>
          <span className="inline-block animate-pulse-loading delay-400">
            &nbsp;.
          </span>
          <span className="inline-block animate-pulse-loading delay-600">
            &nbsp;.
          </span>
        </div>
      </div>
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      loginStatus={loginStatus}
      isLoading={isLoading}
    />
  );
}
