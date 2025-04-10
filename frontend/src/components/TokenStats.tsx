import React, { useState, useEffect } from 'react';

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  whaleActivity: number; // 0-100 scale for whale interest
}

const TokenStats: React.FC = () => {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('whaleActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchTokenData();
  }, []);

  const fetchTokenData = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo purposes, we're using mock data
      const data: TokenData[] = [
        {
          id: '1',
          name: 'Ethereum',
          symbol: 'ETH',
          price: 3245.67,
          priceChange24h: 2.4,
          volume24h: 12567890000,
          marketCap: 389456000000,
          whaleActivity: 87
        },
        {
          id: '2',
          name: 'Solana',
          symbol: 'SOL',
          price: 105.32,
          priceChange24h: 4.8,
          volume24h: 3456789000,
          marketCap: 45678900000,
          whaleActivity: 92
        },
        {
          id: '3',
          name: 'Arbitrum',
          symbol: 'ARB',
          price: 1.23,
          priceChange24h: -1.2,
          volume24h: 567890000,
          marketCap: 3456789000,
          whaleActivity: 76
        },
        {
          id: '4',
          name: 'Avalanche',
          symbol: 'AVAX',
          price: 35.67,
          priceChange24h: 3.1,
          volume24h: 897654000,
          marketCap: 12567890000,
          whaleActivity: 81
        },
        {
          id: '5',
          name: 'Uniswap',
          symbol: 'UNI',
          price: 7.82,
          priceChange24h: -0.8,
          volume24h: 345678000,
          marketCap: 5678900000,
          whaleActivity: 65
        }
      ];
      
      setTokens(data);
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    const valueA = a[sortBy as keyof TokenData];
    const valueB = b[sortBy as keyof TokenData];
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    return 0;
  });

  const formatNumber = (num: number, digits = 0) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(digits)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(digits)}M`;
    }
    if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(digits)}K`;
    }
    return `$${num.toFixed(digits)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Market Intelligence</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Token
                  {sortBy === 'name' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Price
                  {sortBy === 'price' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('priceChange24h')}
                >
                  24h Change
                  {sortBy === 'priceChange24h' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('volume24h')}
                >
                  24h Volume
                  {sortBy === 'volume24h' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('whaleActivity')}
                >
                  Whale Interest
                  {sortBy === 'whaleActivity' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {token.name} <span className="text-gray-500 ml-1">{token.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${token.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${token.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatNumber(token.volume24h)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            token.whaleActivity > 80 ? 'bg-green-600' : 
                            token.whaleActivity > 50 ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${token.whaleActivity}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-700">{token.whaleActivity}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-right">
        <button 
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={fetchTokenData}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default TokenStats; 