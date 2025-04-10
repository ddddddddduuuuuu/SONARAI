import axios from 'axios';

/**
 * Service for interacting with whale-related API endpoints
 */
export class WhaleService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  /**
   * Get the latest active whale wallets
   * @param limit Number of whale wallets to return
   * @returns Promise with whale data
   */
  async getActiveWhales(limit: number = 100): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/whales/active`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active whales:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific whale address
   * @param address Blockchain address of the whale
   * @returns Promise with whale profile data
   */
  async getWhaleProfile(address: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/whales/profile/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching whale profile:', error);
      throw error;
    }
  }

  /**
   * Get recent transactions of a whale address
   * @param address Blockchain address of the whale
   * @param limit Number of transactions to return
   * @returns Promise with transaction data
   */
  async getWhaleTransactions(address: string, limit: number = 20): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/whales/transactions/${address}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching whale transactions:', error);
      throw error;
    }
  }

  /**
   * Get tokens held by a whale address
   * @param address Blockchain address of the whale
   * @returns Promise with token holdings data
   */
  async getWhaleHoldings(address: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/whales/holdings/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching whale holdings:', error);
      throw error;
    }
  }

  /**
   * Track a whale address for notifications
   * @param address Blockchain address to track
   * @param userId User ID requesting the tracking
   * @returns Promise with tracking confirmation
   */
  async trackWhaleAddress(address: string, userId: string): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/whales/track`, {
        address,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking whale address:', error);
      throw error;
    }
  }
} 