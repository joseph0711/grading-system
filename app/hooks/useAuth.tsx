"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  account: string;
  role: string;
  course_id?: string;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(requireCourse: boolean = false) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();

        if (!response.ok || !data.authenticated) {
          router.push("/");
          return;
        }

        if (requireCourse && !data.user.course_id) {
          router.push("/select-course");
          return;
        }

        setUser(data.user);
      } catch (error) {
        setError("Authentication failed");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requireCourse]);

  return { user, isLoading, error };
}
