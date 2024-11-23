"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Login from "./(auth)/login/page";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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

      if (res.ok) {
        // After successful login, navigate to select-course page
        router.push("/select-course");
      } else {
        const data = await res.json();
        alert(data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return <Login onLogin={handleLogin} />;
}
