import Link from "next/link";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          © 2024 Joseph Chiang, 張祐維
        </span>
      </div>
    </footer>
  );
};

export default Footer;
