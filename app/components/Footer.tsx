import { FiGithub, FiMail } from "react-icons/fi";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-lg z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>© 2024 Joseph Chiang, 張祐維</span>
          <span>|</span>
          <span>Version 1.0.0</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiGithub className="w-5 h-5" />
          </Link>
          <Link
            href="mailto:your@email.com"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiMail className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
