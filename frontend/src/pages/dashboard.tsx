import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiActivity, FiAlertTriangle, FiSearch, FiUser, FiLogOut, FiSettings, FiBell } from 'react-icons/fi';
import { useUser } from '../context/UserContext';
import { useAlert } from '../context/AlertContext';

// 仪表盘布局组件
const DashboardLayout = ({ children, currentTab }: { children: React.ReactNode; currentTab: string }) => {
  const { user, logout } = useUser();
  const { addAlert } = useAlert();
  const [notificationCount, setNotificationCount] = useState(3);

  const handleLogout = () => {
    logout();
    addAlert('Successfully logged out', 'success');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* 侧边栏 */}
      <div className="w-64 bg-card-dark border-r border-background-light hidden md:block">
        <div className="p-4">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-display text-primary font-bold">
              SONAR
              <span className="inline-block ml-2 relative">
                <span className="animate-sonar-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </h1>
          </Link>
        </div>

        <nav className="mt-8">
          <ul>
            <li>
              <Link 
                href="/dashboard" 
                className={`flex items-center px-4 py-3 text-text-muted hover:bg-background-light hover:text-primary ${
                  currentTab === 'overview' ? 'bg-background-light text-primary border-l-4 border-primary' : ''
                }`}
              >
                <FiActivity className="mr-3" />
                Overview
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/whale-radar" 
                className={`flex items-center px-4 py-3 text-text-muted hover:bg-background-light hover:text-primary ${
                  currentTab === 'whale-radar' ? 'bg-background-light text-primary border-l-4 border-primary' : ''
                }`}
              >
                <FiSearch className="mr-3" />
                Whale Radar
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/alerts" 
                className={`flex items-center px-4 py-3 text-text-muted hover:bg-background-light hover:text-primary ${
                  currentTab === 'alerts' ? 'bg-background-light text-primary border-l-4 border-primary' : ''
                }`}
              >
                <FiAlertTriangle className="mr-3" />
                Alert Monitor
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/profile" 
                className={`flex items-center px-4 py-3 text-text-muted hover:bg-background-light hover:text-primary ${
                  currentTab === 'profile' ? 'bg-background-light text-primary border-l-4 border-primary' : ''
                }`}
              >
                <FiUser className="mr-3" />
                Personal Intelligence Center
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-background-light">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-background-light flex items-center justify-center text-primary">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">{user?.username || 'Guest'}</div>
              <div className="text-xs text-text-muted">{user?.tier === 'basic' ? 'Basic Member' : user?.tier === 'premium' ? 'Premium Member' : 'Free User'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center py-2 text-text-muted hover:text-primary hover:bg-background-light rounded"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1">
        {/* 顶部导航栏 */}
        <header className="bg-card-dark border-b border-background-light h-16 flex items-center justify-between px-4">
          <div className="md:hidden">
            <Link href="/" className="text-xl font-display text-primary font-bold">
              SONAR
            </Link>
          </div>
          
          <div className="flex items-center ml-auto">
            <div className="relative mr-4">
              <button className="text-text-muted hover:text-primary relative">
                <FiBell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>
            
            <button className="text-text-muted hover:text-primary mr-4">
              <FiSettings size={20} />
            </button>
            
            <div className="md:hidden">
              <div className="w-8 h-8 rounded-full bg-background-light flex items-center justify-center text-primary">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

// 仪表盘主页组件
export default function Dashboard() {
  const [trendingTokens] = useState([
    { id: 1, name: 'SONAR', price: '$0.42', change: '+12.5%', whaleInterest: 'High' },
    { id: 2, name: 'SOL', price: '$136.78', change: '+5.2%', whaleInterest: 'Very High' },
    { id: 3, name: 'BONK', price: '$0.00032', change: '+22.7%', whaleInterest: 'Medium' },
    { id: 4, name: 'JTO', price: '$3.85', change: '-2.3%', whaleInterest: 'Low' },
    { id: 5, name: 'PYTH', price: '$0.58', change: '+8.1%', whaleInterest: 'High' },
  ]);

  const [recentAlerts] = useState([
    { id: 1, type: 'Whale Movement', token: 'SOL', message: 'Large address 7zJ4...rNQ8 transferred 12,500 SOL', time: '5 minutes ago', severity: 'high' },
    { id: 2, type: 'Price Alert', token: 'BONK', message: 'BONK price surged over 15% in the last 30 minutes', time: '32 minutes ago', severity: 'medium' },
    { id: 3, type: 'Whale Accumulation', token: 'SONAR', message: 'Multiple large addresses started accumulating SONAR', time: '1 hour ago', severity: 'medium' },
    { id: 4, type: 'Fund Flow', token: 'JTO', message: 'Large funds flowed out of JTO to stablecoins', time: '3 hours ago', severity: 'low' },
  ]);

  return (
    <>
      <Head>
        <title>Dashboard | SONAR</title>
      </Head>
      
      <DashboardLayout currentTab="overview">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Market Overview</h1>
          <p className="text-text-muted">Welcome to SONAR's trading intelligence center. Here are the latest market dynamics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-primary-dark to-primary p-4">
            <h3 className="text-lg font-medium mb-1 text-white opacity-90">Active Whale Count</h3>
            <div className="text-3xl font-bold text-white">152</div>
            <div className="text-white opacity-80 text-sm mt-2">+12% from yesterday</div>
          </div>

          <div className="card bg-gradient-to-br from-secondary-dark to-secondary p-4">
            <h3 className="text-lg font-medium mb-1 text-white opacity-90">Today's Trading Volume</h3>
            <div className="text-3xl font-bold text-white">$1.57B</div>
            <div className="text-white opacity-80 text-sm mt-2">+3.2% from yesterday</div>
          </div>

          <div className="card bg-gradient-to-br from-accent-dark to-accent p-4">
            <h3 className="text-lg font-medium mb-1 text-white opacity-90">Large Transaction Count</h3>
            <div className="text-3xl font-bold text-white">478</div>
            <div className="text-white opacity-80 text-sm mt-2">+23% from yesterday</div>
          </div>

          <div className="card p-4">
            <h3 className="text-lg font-medium mb-1">Market Sentiment Index</h3>
            <div className="text-3xl font-bold text-primary">64 <span className="text-secondary text-sm">Stable Growth</span></div>
            <div className="text-text-muted text-sm mt-2">+8 points from yesterday</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Trending Tokens</h2>
              <Link href="/dashboard/whale-radar" className="text-primary text-sm hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-background-light">
                    <th className="text-left py-2 text-text-muted font-medium">Token</th>
                    <th className="text-right py-2 text-text-muted font-medium">Price</th>
                    <th className="text-right py-2 text-text-muted font-medium">24h Change</th>
                    <th className="text-right py-2 text-text-muted font-medium">Whale Interest</th>
                  </tr>
                </thead>
                <tbody>
                  {trendingTokens.map((token) => (
                    <tr key={token.id} className="border-b border-background-light hover:bg-background-light">
                      <td className="py-3 font-medium">{token.name}</td>
                      <td className="py-3 text-right">{token.price}</td>
                      <td className={`py-3 text-right ${
                        token.change.startsWith('+') ? 'text-secondary' : 'text-accent'
                      }`}>
                        {token.change}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`badge ${
                          token.whaleInterest === 'Very High' ? 'badge-accent' :
                          token.whaleInterest === 'High' ? 'badge-primary' :
                          token.whaleInterest === 'Medium' ? 'badge-secondary' : 'text-text-muted'
                        }`}>
                          {token.whaleInterest}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Alerts</h2>
              <Link href="/dashboard/alerts" className="text-primary text-sm hover:underline">
                View all alerts
              </Link>
            </div>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg bg-background-light border-l-4 border-opacity-50 hover:bg-card-light transition-colors cursor-pointer"
                  style={{ borderLeftColor: alert.severity === 'high' ? 'var(--color-accent)' : 
                                          alert.severity === 'medium' ? 'var(--color-primary)' : 
                                          'var(--color-secondary)' }}
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{alert.type}</span>
                    <span className="text-xs text-text-muted">{alert.time}</span>
                  </div>
                  <div className="mt-1 font-medium">{alert.token}</div>
                  <div className="mt-1 text-sm text-text-muted">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
} 