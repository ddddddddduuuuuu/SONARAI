/**
 * Utility functions for blockchain-related operations
 */

/**
 * Format an address for display by truncating the middle part
 * @param address Full blockchain address
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns Formatted address string
 */
export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format a currency value with appropriate decimal places
 * @param value Currency value
 * @param decimals Number of decimal places to show
 * @param symbol Currency symbol
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | string, decimals: number = 4, symbol: string = ''): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return `0 ${symbol}`.trim();
  
  const formatted = numValue.toFixed(decimals);
  return `${formatted} ${symbol}`.trim();
};

/**
 * Convert a timestamp to a human-readable relative time
 * @param timestamp Timestamp to convert
 * @returns Human-readable relative time string
 */
export const timeAgo = (timestamp: number | Date): string => {
  const now = new Date();
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

/**
 * Calculate the percentage change between two values
 * @param current Current value
 * @param previous Previous value
 * @returns Percentage change
 */
export const percentChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get blockchain explorer URL for a specific network
 * @param network Blockchain network (ethereum, solana, etc.)
 * @param type Type of entity (transaction, address, token)
 * @param value Value to create URL for
 * @returns Explorer URL
 */
export const getExplorerUrl = (network: string, type: 'tx' | 'address' | 'token', value: string): string => {
  switch (network.toLowerCase()) {
    case 'ethereum':
      return `https://etherscan.io/${type}/${value}`;
    case 'solana':
      return `https://explorer.solana.com/${type}/${value}`;
    default:
      return '';
  }
};

/**
 * Determine if a transaction is significant based on value thresholds
 * @param value Transaction value
 * @param token Token symbol
 * @returns Boolean indicating if transaction is significant
 */
export const isSignificantTransaction = (value: number, token: string): boolean => {
  const thresholds: Record<string, number> = {
    'ETH': 100,
    'SOL': 1000,
    'BTC': 5,
    'USDT': 1000000,
    'USDC': 1000000,
    'default': 100000
  };
  
  const threshold = thresholds[token] || thresholds.default;
  return value >= threshold;
};

/**
 * Parse token amount with correct decimals
 * @param amount Raw token amount
 * @param decimals Token decimals
 * @returns Parsed amount
 */
export const parseTokenAmount = (amount: string, decimals: number = 18): number => {
  try {
    const value = BigInt(amount);
    const divisor = BigInt(10) ** BigInt(decimals);
    const beforeDecimal = value / divisor;
    const afterDecimal = value % divisor;
    
    return Number(beforeDecimal.toString() + '.' + afterDecimal.toString().padStart(decimals, '0'));
  } catch (error) {
    console.error('Error parsing token amount:', error);
    return 0;
  }
}; 