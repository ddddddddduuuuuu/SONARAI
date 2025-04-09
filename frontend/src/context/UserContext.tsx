import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  walletAddress?: string;
  avatarUrl?: string;
  tier: 'free' | 'basic' | 'premium';
  sonarBalance: number;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中的用户会话
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // 这里应该是向后端API验证token的请求
          // 对于MVP，我们模拟一个成功的响应
          setUser({
            id: 'user-123',
            username: 'demo_user',
            email: 'demo@sonar.ai',
            tier: 'basic',
            sonarBalance: 1000,
          });
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 在实际项目中，这里应该是一个API请求
      // 对于MVP，我们模拟一个成功的登录
      const mockUser = {
        id: 'user-123',
        username: 'demo_user',
        email,
        tier: 'basic',
        sonarBalance: 1000,
      };

      localStorage.setItem('token', 'mock-jwt-token');
      setUser(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      // 在实际项目中，这里应该是一个API请求
      // 对于MVP，我们模拟一个成功的注册
      const mockUser = {
        id: 'user-' + Date.now(),
        username,
        email,
        tier: 'free',
        sonarBalance: 0,
      };

      localStorage.setItem('token', 'mock-jwt-token');
      setUser(mockUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const connectWallet = async () => {
    try {
      // 在实际项目中，这里应该使用Solana钱包适配器
      // 对于MVP，我们模拟一个成功的钱包连接
      if (user) {
        setUser({
          ...user,
          walletAddress: '5YourSolanaWalletAddressHere1234567890',
        });
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    if (user) {
      const { walletAddress, ...userWithoutWallet } = user;
      setUser(userWithoutWallet as User);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 