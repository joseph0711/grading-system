import toast from "react-hot-toast";
import { useSettings } from "@/app/contexts/SettingsContext";

export function useToast() {
  const { t } = useSettings();

  const showToast = {
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading?: string;
        success?: string;
        error?: string;
      } = {}
    ) => {
      return toast.promise(promise, {
        loading: messages.loading || t.loading,
        success: messages.success || t.saveSuccess,
        error: messages.error || t.saveFailed,
      });
    },
    
    error: (message: string, duration = 4000) => {
      toast.error(message, { duration });
    },

    success: (message: string, duration = 2000) => {
      toast.success(message, { duration });
    },

    warning: (message: string, duration = 3000) => {
      toast(message, {
        duration,
        icon: '⚠️',
        style: {
          backgroundColor: '#FFFBEB',
          color: '#B45309',
          padding: '1rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      });
    },

    dismiss: toast.dismiss
  };

  return showToast;
} 