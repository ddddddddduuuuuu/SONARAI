/**
 * Service for handling alerts and notifications
 */
export class AlertService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  /**
   * Get all alerts for a user
   * @param userId User ID
   * @param page Page number for pagination
   * @param limit Items per page
   * @returns Promise with alerts data
   */
  async getUserAlerts(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/alerts/user/${userId}?page=${page}&limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      throw error;
    }
  }

  /**
   * Create a new alert configuration
   * @param alertConfig Alert configuration object
   * @returns Promise with created alert data
   */
  async createAlert(alertConfig: any): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertConfig),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Update an existing alert configuration
   * @param alertId Alert ID
   * @param alertConfig Updated alert configuration
   * @returns Promise with updated alert data
   */
  async updateAlert(alertId: string, alertConfig: any): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertConfig),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating alert:', error);
      throw error;
    }
  }

  /**
   * Delete an alert configuration
   * @param alertId Alert ID
   * @returns Promise with deletion confirmation
   */
  async deleteAlert(alertId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/alerts/${alertId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  /**
   * Mark an alert as read
   * @param alertId Alert ID
   * @returns Promise with updated alert data
   */
  async markAlertAsRead(alertId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/alerts/${alertId}/read`, {
        method: 'PUT',
      });
      return await response.json();
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time alerts
   * @param userId User ID
   * @param callback Function to call when a new alert arrives
   * @returns Unsubscribe function
   */
  subscribeToAlerts(userId: string, callback: (alert: any) => void): () => void {
    // This would typically use WebSockets or SSE
    console.log(`Subscribed to alerts for user ${userId}`);
    
    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribed from alerts for user ${userId}`);
    };
  }
} 