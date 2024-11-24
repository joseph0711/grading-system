"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Login from "./(auth)/login/page";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<{
    message: string;
    type: "error" | "warning" | "info" | null;
    attemptsLeft?: number;
    remainingTime?: number;
  }>({ message: "", type: null });

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

  return <Login onLogin={handleLogin} loginStatus={loginStatus} isLoading={isLoading} />;
}
