import React, { ReactNode, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiActivity, FiBell, FiUser, FiSettings, FiSun, FiMoon } from 'react-icons/fi';
import { ThemeContext } from '../context/ThemeContext';
import { UserContext } from '../context/UserContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(UserContext);
  
  // Check if current page path matches the nav item
  const isActive = (path: string) => {
    return router.pathname === path;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top navigation bar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img
                  className="h-8 w-auto mr-2"
                  src="/images/logo.png"
                  alt="SONAR Logo"
                />
                <span className="text-xl font-bold">SONAR</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>
              
              {user ? (
                <div className="flex items-center">
                  <span className="mr-2">{user.name}</span>
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Link href="/login" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1.5 rounded-md text-sm">
                    Login
                  </Link>
                  <Link href="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content area */}
      <div className="flex-grow flex">
        {/* Side navigation */}
        <nav className="w-64 bg-white dark:bg-gray-800 shadow-sm hidden md:block">
          <div className="px-4 py-6 space-y-4">
            <Link href="/" className={`flex items-center px-3 py-2 rounded-md ${isActive('/') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiHome className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            
            <Link href="/whales" className={`flex items-center px-3 py-2 rounded-md ${isActive('/whales') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiActivity className="mr-3 h-5 w-5" />
              Whale Tracker
            </Link>
            
            <Link href="/alerts" className={`flex items-center px-3 py-2 rounded-md ${isActive('/alerts') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiBell className="mr-3 h-5 w-5" />
              Alerts
            </Link>
            
            <Link href="/profile" className={`flex items-center px-3 py-2 rounded-md ${isActive('/profile') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiUser className="mr-3 h-5 w-5" />
              Profile
            </Link>
            
            <Link href="/settings" className={`flex items-center px-3 py-2 rounded-md ${isActive('/settings') ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiSettings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </div>
        </nav>
        
        {/* Page content */}
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} SONAR. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="https://x.com/SolanaSonar" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300">Twitter</a>
            <a href="https://github.com/ddddddddduuuuuu/SONAR" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300">GitHub</a>
            <a href="http://sonar.tel/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300">Website</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 