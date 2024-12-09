import { Toaster } from "react-hot-toast";

export const TOAST_CONFIG = {
  position: "top-center" as const,
  duration: 3000,
  className: "dark:bg-gray-800 dark:text-white",
  style: {
    padding: "16px",
    borderRadius: "8px",
    minWidth: "200px",
  },
  success: {
    duration: 2000,
    iconTheme: {
      primary: "white",
      secondary: "#059669",
    },
    style: {
      background: "#059669",
      color: "white",
    },
  },
  error: {
    duration: 4000,
    iconTheme: {
      primary: "white",
      secondary: "#DC2626",
    },
    style: {
      background: "#DC2626",
      color: "white",
    },
  },
  loading: {
    duration: Infinity,
    iconTheme: {
      primary: "white",
      secondary: "#2563EB",
    },
    style: {
      background: "#2563EB",
      color: "white",
    },
  },
};

export function ToastProvider() {
  return <Toaster toastOptions={TOAST_CONFIG} />;
}
