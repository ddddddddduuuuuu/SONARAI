import React, { useState, useEffect } from 'react';
import { WhaleService } from '../services/whaleService';
import { formatAddress, formatCurrency, timeAgo, getExplorerUrl } from '../utils/blockchainUtils';

interface Whale {
  address: string;
  blockchain: string;
  lastActive: Date;
  transactionCount: number;
  totalValue: number;
  recentTransactions: Transaction[];
}

interface Transaction {
  txHash: string;
  timestamp: Date;
  value: number;
  token: string;
  type: 'in' | 'out';
}

const WhaleTracker: React.FC = () => {
  const [whales, setWhales] = useState<Whale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWhale, setSelectedWhale] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  const whaleService = new WhaleService();

  useEffect(() => {
    fetchWhales();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      if (isTracking) {
        fetchWhales();
      }
    }, 30000); // Poll every 30 seconds when tracking is enabled
    
    return () => clearInterval(interval);
  }, [isTracking]);

  const fetchWhales = async () => {
    try {
      setLoading(true);
      const data = await whaleService.getActiveWhales(20);
      setWhales(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch whale data. Please try again later.');
      console.error('Error fetching whales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhaleSelect = async (address: string) => {
    if (selectedWhale === address) {
      setSelectedWhale(null);
      return;
    }
    
    setSelectedWhale(address);
    try {
      const profile = await whaleService.getWhaleProfile(address);
      const transactions = await whaleService.getWhaleTransactions(address);
      
      // Update whale with additional details
      setWhales(whales.map(whale => 
        whale.address === address 
          ? { ...whale, ...profile, recentTransactions: transactions } 
          : whale
      ));
    } catch (err) {
      console.error('Error fetching whale details:', err);
    }
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const handleTrackWhale = async (address: string) => {
    try {
      // In a real app, you would get userId from auth context
      const userId = 'current-user-id';
      await whaleService.trackWhaleAddress(address, userId);
      alert(`Now tracking whale address: ${formatAddress(address)}`);
    } catch (err) {
      console.error('Error tracking whale:', err);
    }
  };

  if (loading && whales.length === 0) {
    return <div className="p-4 text-center">Loading whale data...</div>;
  }

  if (error && whales.length === 0) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Whale Radar</h2>
        <div>
          <button 
            onClick={toggleTracking}
            className={`px-4 py-2 rounded-md ${isTracking 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'} text-white`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Live Tracking'}
          </button>
          <button 
            onClick={fetchWhales}
            className="ml-2 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && <div className="text-center my-2">Refreshing data...</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {whales.map((whale) => (
              <React.Fragment key={whale.address}>
                <tr 
                  className={`hover:bg-gray-50 cursor-pointer ${selectedWhale === whale.address ? 'bg-blue-50' : ''}`}
                  onClick={() => handleWhaleSelect(whale.address)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAddress(whale.address)}
                        </div>
                        <div className="text-sm text-gray-500">
                          <a 
                            href={getExplorerUrl(whale.blockchain, 'address', whale.address)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-500 hover:underline"
                          >
                            View on Explorer
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {whale.blockchain.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {timeAgo(new Date(whale.lastActive))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {whale.transactionCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrackWhale(whale.address);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Track
                    </button>
                  </td>
                </tr>
                {selectedWhale === whale.address && whale.recentTransactions && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="text-sm">
                        <h4 className="font-medium mb-2">Recent Transactions</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {whale.recentTransactions.map((tx, index) => (
                            <div key={index} className="border rounded-md p-2 bg-white">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  {timeAgo(new Date(tx.timestamp))}
                                </span>
                                <span className={`font-medium ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                  {tx.type === 'in' ? '+' : '-'} {formatCurrency(tx.value, 4, tx.token)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                <a 
                                  href={getExplorerUrl(whale.blockchain, 'tx', tx.txHash)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {tx.txHash}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WhaleTracker; 