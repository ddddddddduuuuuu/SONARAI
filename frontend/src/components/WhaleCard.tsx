import React from 'react';
import { formatDistance } from 'date-fns';

interface WhaleData {
  id: string;
  address: string;
  name?: string;
  lastActivity: Date;
  tokens: {
    symbol: string;
    amount: number;
    valueUSD: number;
  }[];
  influence: number;
  recentTransactions: {
    type: 'buy' | 'sell' | 'transfer';
    token: string;
    amount: number;
    timestamp: Date;
  }[];
}

interface WhaleCardProps {
  whale: WhaleData;
  onViewDetails: (id: string) => void;
  onSetAlert: (address: string) => void;
}

const WhaleCard: React.FC<WhaleCardProps> = ({ whale, onViewDetails, onSetAlert }) => {
  // Format address to show only first 6 and last 4 characters
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Get primary token (highest value)
  const getPrimaryToken = () => {
    if (!whale.tokens || whale.tokens.length === 0) return null;
    return [...whale.tokens].sort((a, b) => b.valueUSD - a.valueUSD)[0];
  };
  
  const primaryToken = getPrimaryToken();
  
  // Calculate total holdings value
  const totalValue = whale.tokens.reduce((sum, token) => sum + token.valueUSD, 0);
  
  // Get latest transaction
  const latestTransaction = whale.recentTransactions && whale.recentTransactions.length > 0 
    ? whale.recentTransactions[0] 
    : null;
  
  // Format time
  const formatTime = (date: Date) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };
  
  // Transaction type colors and icons
  const getTransactionDetails = (type: 'buy' | 'sell' | 'transfer') => {
    switch (type) {
      case 'buy':
        return { color: 'text-green-500', icon: '↗️', label: 'Bought' };
      case 'sell':
        return { color: 'text-red-500', icon: '↘️', label: 'Sold' };
      case 'transfer':
        return { color: 'text-blue-500', icon: '↔️', label: 'Transferred' };
      default:
        return { color: 'text-gray-500', icon: '•', label: 'Unknown' };
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {whale.name || formatAddress(whale.address)}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {whale.name && formatAddress(whale.address)}
            </p>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              🐳 Influence: {whale.influence.toFixed(1)}/10
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Primary Token</p>
            {primaryToken ? (
              <p className="font-medium dark:text-white">
                {primaryToken.symbol} ({primaryToken.amount.toLocaleString()})
              </p>
            ) : (
              <p className="font-medium text-gray-400">No data</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
            <p className="font-medium dark:text-white">
              ${totalValue.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Last Activity</p>
          {latestTransaction ? (
            <div className="flex items-center mt-1">
              <span className={getTransactionDetails(latestTransaction.type).color}>
                {getTransactionDetails(latestTransaction.type).icon} {getTransactionDetails(latestTransaction.type).label}
              </span>
              <span className="mx-1 text-sm dark:text-white">
                {latestTransaction.amount.toLocaleString()} {latestTransaction.token}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(latestTransaction.timestamp)}
              </span>
            </div>
          ) : (
            <p className="font-medium text-gray-400">No recent activity</p>
          )}
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={() => onSetAlert(whale.address)}
            className="px-3 py-1.5 text-sm border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-200"
          >
            Set Alert
          </button>
          <button
            onClick={() => onViewDetails(whale.id)}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhaleCard; 