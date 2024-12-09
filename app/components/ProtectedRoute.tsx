"use client";

import { useAuth } from "../hooks/useAuth";
import LoadingSkeleton from "./LoadingSkeleton";
import { useToast } from "../hooks/useToast";
import { useSettings } from "../contexts/SettingsContext";
import { useRef, useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCourse?: boolean;
  allowedRoles?: string[];
  loadingComponent?: React.ReactNode;
  loadingDelay?: number;
  className?: string;
}

export default function ProtectedRoute({
  children,
  requireCourse = false,
  allowedRoles,
  loadingComponent,
  loadingDelay = 0,
  className = "",
}: ProtectedRouteProps) {
  const { user, isLoading, error } = useAuth(requireCourse);
  const toast = useToast();
  const { t } = useSettings();
  const toastShown = useRef(false);
  const [showLoading, setShowLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, loadingDelay);

      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingDelay]);

  useEffect(() => {
    if (!isLoading && !toastShown.current) {
      if (error) {
        toast.error(t.authenticationFailed);
        toastShown.current = true;
      } else if (!user) {
        toast.warning(t.pleaseLoginFirst);
        toastShown.current = true;
      } else if (requireCourse && !user.course_id) {
        toast.warning(t.noCourseSelected);
        toastShown.current = true;
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        toast.error(t.unauthorized);
        toastShown.current = true;
      }
    }
  }, [isLoading, error, user, requireCourse, allowedRoles, t, toast]);

  if (!mounted) {
    return null;
  }

  if (showLoading || isLoading) {
    return loadingComponent || <LoadingSkeleton />;
  }

  if (error || !user) {
    return null;
  }

  if (requireCourse && !user.course_id) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return (
    <div 
      className={`transition-all duration-300 opacity-0 animate-fadeIn ${className}`}
    >
      {children}
    </div>
  );
}
