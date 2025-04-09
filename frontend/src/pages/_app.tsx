import { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import '../styles/globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';
import { AlertProvider } from '../context/AlertContext';

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟初始化加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl text-primary font-display">
          SONAR
          <span className="inline-block ml-2 relative">
            <span className="animate-sonar-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <AlertProvider>
          <Component {...pageProps} />
        </AlertProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default MyApp; 