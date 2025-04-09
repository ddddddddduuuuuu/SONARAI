/**
 * Blockchain Service
 * Provides core functionality for blockchain interaction
 */

const axios = require('axios');
const Web3 = require('web3');
const { Connection } = require('@solana/web3.js');
require('dotenv').config();

// Configure blockchain connections
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/your-infura-key';
const SOL_RPC_URL = process.env.SOL_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Initialize connections
const web3 = new Web3(new Web3.providers.HttpProvider(ETH_RPC_URL));
const solanaConnection = new Connection(SOL_RPC_URL);

/**
 * Get Ethereum wallet balance
 * @param {string} address Wallet address
 * @returns {Promise<string>} Balance (in ETH units)
 */
const getEthBalance = async (address) => {
  try {
    const balanceWei = await web3.eth.getBalance(address);
    return web3.utils.fromWei(balanceWei, 'ether');
  } catch (error) {
    console.error('Failed to get ETH balance:', error);
    throw new Error('Failed to get ETH balance');
  }
};

/**
 * Get Solana wallet balance
 * @param {string} address Wallet address
 * @returns {Promise<number>} Balance (in SOL units)
 */
const getSolBalance = async (address) => {
  try {
    const balance = await solanaConnection.getBalance(address);
    return balance / 1000000000; // Convert to SOL units
  } catch (error) {
    console.error('Failed to get SOL balance:', error);
    throw new Error('Failed to get SOL balance');
  }
};

/**
 * Get recent Ethereum transactions
 * @param {string} address Wallet address
 * @param {number} limit Limit the number of results
 * @returns {Promise<Array>} Transaction list
 */
const getEthTransactions = async (address, limit = 10) => {
  try {
    // Using Etherscan API as an example, in a real project you might need to use another API or fetch directly from a node
    const apiKey = process.env.ETHERSCAN_API_KEY;
    const response = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`);
    
    if (response.data.status === '1') {
      return response.data.result;
    }
    return [];
  } catch (error) {
    console.error('Failed to get ETH transactions:', error);
    throw new Error('Failed to get ETH transactions');
  }
};

/**
 * Detect large transfer transactions
 * @param {string} blockchain Blockchain name ('ethereum' or 'solana')
 * @param {number} threshold Large amount threshold (in respective currency units)
 * @returns {Promise<Array>} List of large transactions
 */
const detectLargeTransfers = async (blockchain, threshold) => {
  try {
    // This is an example implementation, a real project would need more complex logic
    if (blockchain === 'ethereum') {
      // Here you could use ethers.js or web3.js to monitor new blocks and transactions
      // Filter for large transfers
      // Return transactions that meet the criteria
    } else if (blockchain === 'solana') {
      // Use @solana/web3.js to monitor transactions
      // Filter for large transfers
      // Return transactions that meet the criteria
    }
    
    return []; // Example returning empty array
  } catch (error) {
    console.error('Failed to detect large transfers:', error);
    throw new Error('Failed to detect large transfers');
  }
};

/**
 * Get token price
 * @param {string} tokenSymbol Token symbol
 * @param {string} currency Currency unit (default 'usd')
 * @returns {Promise<number>} Token price
 */
const getTokenPrice = async (tokenSymbol, currency = 'usd') => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol.toLowerCase()}&vs_currencies=${currency}`);
    return response.data[tokenSymbol.toLowerCase()][currency];
  } catch (error) {
    console.error('Failed to get token price:', error);
    throw new Error('Failed to get token price');
  }
};

module.exports = {
  getEthBalance,
  getSolBalance,
  getEthTransactions,
  detectLargeTransfers,
  getTokenPrice
}; 