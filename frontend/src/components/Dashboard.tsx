import React, { useState, useEffect } from 'react';
import { AlertService } from '../services/alertService';
import { formatCurrency, timeAgo } from '../utils/blockchainUtils';
import WhaleTracker from './WhaleTracker';
import TokenStats from './TokenStats';

interface Alert {
  id: string;
  type: 'address' | 'token' | 'pattern' | 'volume';
  message: string;
  timestamp: Date;
  read: boolean;
  severity: 'low' | 'medium' | 'high';
  data: {
    address?: string;
    token?: string;
    value?: number;
    txHash?: string;
  };
}

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  whaleInterestScore: number;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'whaleRadar' | 'alerts' | 'market'>('whaleRadar');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);

  const alertService = new AlertService();

  useEffect(() => {
    fetchAlerts();
    // In a real app, this would call an API to get token data
    fetchMockTokenData();

    // Set up alert subscription
    const userId = 'current-user-id'; // In a real app, this would come from auth context
    const unsubscribe = alertService.subscribeToAlerts(userId, handleNewAlert);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      // In a real app, this would come from auth context
      const userId = 'current-user-id';
      const data = await alertService.getUserAlerts(userId);
      setAlerts(data || []);
      setUnreadAlerts(data?.filter((alert: Alert) => !alert.read).length || 0);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  const fetchMockTokenData = () => {
    // This is mock data - in a real app, this would come from an API
    const mockTokens: TokenData[] = [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3450.75,
        priceChange24h: 2.5,
        volume24h: 15000000000,
        whaleInterestScore: 85
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        price: 128.32,
        priceChange24h: 5.7,
        volume24h: 3500000000,
        whaleInterestScore: 92
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 59832.10,
        priceChange24h: -1.2,
        volume24h: 28900000000,
        whaleInterestScore: 78
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        price: 1.00,
        priceChange24h: 0.01,
        volume24h: 67000000000,
        whaleInterestScore: 65
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        price: 1.00,
        priceChange24h: 0.00,
        volume24h: 3800000000,
        whaleInterestScore: 62
      },
    ];
    
    setTokens(mockTokens);
  };

  const handleNewAlert = (alert: Alert) => {
    setAlerts(prevAlerts => [alert, ...prevAlerts]);
    setUnreadAlerts(prevCount => prevCount + 1);
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      await alertService.markAlertAsRead(alertId);
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
      setUnreadAlerts(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const renderAlerts = () => {
    if (alerts.length === 0) {
      return <div className="text-center p-8 text-gray-500">No alerts found. Set up tracking to receive alerts.</div>;
    }

    return (
      <div className="space-y-4">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className={`p-4 rounded-lg border ${alert.read ? 'bg-white' : 'bg-blue-50'} ${
              alert.severity === 'high' ? 'border-red-300' :
              alert.severity === 'medium' ? 'border-yellow-300' : 'border-gray-300'
            }`}
            onClick={() => !alert.read && markAlertAsRead(alert.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{alert.message}</h4>
                <p className="text-sm text-gray-500">{timeAgo(new Date(alert.timestamp))}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {alert.severity.toUpperCase()}
              </span>
            </div>
            {alert.data && (
              <div className="mt-2 text-sm">
                {alert.data.token && (
                  <span className="mr-4">Token: <span className="font-medium">{alert.data.token}</span></span>
                )}
                {alert.data.value && (
                  <span className="mr-4">Value: <span className="font-medium">{formatCurrency(alert.data.value)}</span></span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderMarketInsights = () => {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Top Tokens by Whale Interest</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (24h)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Whale Interest</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokens.sort((a, b) => b.whaleInterestScore - a.whaleInterestScore).map(token => (
                <tr key={token.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{token.symbol}</div>
                        <div className="text-sm text-gray-500">{token.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      token.priceChange24h > 0 ? 'bg-green-100 text-green-800' : 
                      token.priceChange24h < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(token.volume24h / 1000000000).toFixed(2)}B
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${token.whaleInterestScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{token.whaleInterestScore}/100</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Market Sentiment</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-700">Bullish Signals</h4>
              <p className="text-sm text-gray-700 mt-2">Majority of whale wallets are accumulating in the last 24 hours</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-700">Tokens to Watch</h4>
              <p className="text-sm text-gray-700 mt-2">SOL, ETH showing increased whale interest with price consolidation</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-700">Risk Indicators</h4>
              <p className="text-sm text-gray-700 mt-2">Increased outflows from exchanges, potential market volatility ahead</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview */}
        <div className="col-span-2">
          <TokenStats />
        </div>
        
        {/* Wallet Connect Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Wallet</h2>
          
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4 text-center">Connect your wallet to track your portfolio and access exclusive features</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full">
              Connect Wallet
            </button>
          </div>
        </div>
        
        {/* Portfolio Chart */}
        <div className="bg-white rounded-lg shadow p-6 col-span-full">
          <h2 className="text-xl font-bold mb-4">Market Trend</h2>
          
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-4">
            {['1D', '1W', '1M', 'ALL'].map((period) => (
              <button 
                key={period} 
                className="py-2 text-center rounded text-sm font-medium border border-gray-200 hover:bg-gray-50"
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        {/* Whale Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Whale Activity</h2>
          
          <div className="space-y-4">
            {['ETH', 'SOL', 'ARB'].map((token) => (
              <div key={token} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <div className="font-medium">{token}</div>
                  <div className="text-sm text-gray-500">Large transactions</div>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  High Activity
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Activity
          </button>
        </div>
        
        {/* News & Insights */}
        <div className="bg-white rounded-lg shadow p-6 col-span-2">
          <h2 className="text-xl font-bold mb-4">News & Insights</h2>
          
          <div className="space-y-4">
            {[
              { title: 'Major ETH Movement Detected', time: '2 hours ago' },
              { title: 'SOL Whales Accumulating', time: '5 hours ago' },
              { title: 'Market Analysis: Whale Behavior', time: '1 day ago' },
            ].map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-3">
                <h3 className="font-medium hover:text-blue-600 cursor-pointer">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.time}</p>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All News
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 