"use client";

import { useRouter } from "next/navigation";
import { useSettings } from "../contexts/SettingsContext";
import { usePageTitle } from "../hooks/usePageTitle";

const UnauthorizedPage = () => {
  usePageTitle("unauthorized");
  const router = useRouter();
  const { t } = useSettings();

  const handleBackToLogin = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.unauthorized || "Unauthorized Access"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t.unauthorizedMessage ||
              "You don't have permission to access this page."}
          </p>
          <button
            onClick={handleBackToLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {t.backToLogin || "Back to Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 