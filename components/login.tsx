"use client";

import { useState } from "react";

interface LoginProps {
  onLogin: (
    account: string,
    password: string,
    rememberMe: boolean,
    role: string
  ) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account, password, rememberMe }),
      });

      if (response.ok) {
        const data = await response.json();
        const sessionResponse = await fetch("/api/session");
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          onLogin(account, password, rememberMe, sessionData.user.role);
        } else {
          setErrorMessage("Session retrieval failed.");
        }
      } else {
        setErrorMessage("Invalid account or password");
      }
    } catch (error) {
      setErrorMessage("Login failed. Please try again later.");
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
            Sign In
          </h2>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-sm font-medium dark:text-gray-300">
              Account:
              <input
                type="text"
                className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
              />
            </label>
            <label className="text-sm font-medium dark:text-gray-300">
              Password:
              <input
                type="password"
                className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm dark:text-gray-300"
              >
                Remember me
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Sign In
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
