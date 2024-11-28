"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/app/contexts/SettingsContext";
import SettingsButtons from "../../components/SettingsButtons";
import { toast, Toaster } from "react-hot-toast";

interface LoginProps {
  onLogin: (
    account: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;
  loginStatus: {
    message: string;
    type: "error" | "warning" | "info" | null;
    attemptsLeft?: number;
    remainingTime?: number;
  };
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, loginStatus, isLoading }) => {
  const { t } = useSettings();

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (loginStatus.message) {
      toast.dismiss();
      const toastId = "login-status-toast";

      switch (loginStatus.type) {
        case "error":
          toast.error(
            loginStatus.message.includes("Account is locked")
              ? t.accountLocked.replace(
                  "{minutes}",
                  Math.ceil(loginStatus.remainingTime!).toString()
                )
              : loginStatus.message,
            {
              id: toastId,
              duration: 4000,
            }
          );
          break;
        case "warning":
          toast.custom(
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg shadow-md flex items-start">
              <svg
                className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                {loginStatus.attemptsLeft && loginStatus.attemptsLeft > 0 && (
                  <p className="text-sm mt-1">
                    {t.loginWarningAttempts
                      .replace(
                        "{attempts}",
                        loginStatus.attemptsLeft.toString()
                      )
                      .replace(
                        "{minutes}",
                        loginStatus.remainingTime
                          ? Math.ceil(loginStatus.remainingTime / 60).toString()
                          : ""
                      )}
                  </p>
                )}
              </div>
            </div>,
            { id: toastId }
          );
          break;
        case "info":
          toast(loginStatus.message, { id: toastId });
          break;
      }
    }
  }, [loginStatus, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(account, password, rememberMe);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-md">
        <div className="fixed top-4 right-4">
          <SettingsButtons />
        </div>

        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text mb-2">
            {t.welcome}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{t.signInToSystem}</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl backdrop-blur-sm backdrop-filter p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.account}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className={`h-5 w-5 ${
                      isLoading
                        ? "text-gray-300 dark:text-gray-500"
                        : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 
                    rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 text-sm transition-colors
                    ${
                      isLoading
                        ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                        : "bg-white"
                    }`}
                  required
                  placeholder={t.enterAccount}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className={`h-5 w-5 ${
                      isLoading
                        ? "text-gray-300 dark:text-gray-500"
                        : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 
                    rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                    focus:border-transparent text-gray-900 dark:text-white dark:bg-gray-700 text-sm transition-colors
                    ${
                      isLoading
                        ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                        : "bg-white"
                    }`}
                  required
                  placeholder={t.enterPassword}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className={`w-4 h-4 text-blue-600 border-gray-300 rounded 
                    focus:ring-blue-500 dark:focus:ring-blue-400 
                    dark:bg-gray-700 dark:border-gray-600
                    ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
                />
                <span
                  className={`ml-2 text-sm text-gray-600 dark:text-gray-300 
                  ${isLoading ? "opacity-50" : ""}`}
                >
                  {t.rememberMe}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent 
                rounded-lg shadow-sm text-sm font-medium text-white 
                bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                transition-all duration-300 transform hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t.signingIn}
                </div>
              ) : (
                t.signIn
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
