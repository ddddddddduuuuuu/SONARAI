/**
 * Blockchain Monitor Utility
 * 
 * Monitors blockchain transactions and detects whale movements
 */

const Web3 = require('web3');
const { Connection } = require('@solana/web3.js');
const config = require('../config/config');
const WhaleModel = require('../models/WhaleModel');
const AlertModel = require('../models/AlertModel');
const TokenModel = require('../models/TokenModel');

class BlockchainMonitor {
  constructor() {
    this.ethereumProvider = new Web3(config.ethereum.rpcUrl);
    this.solanaConnection = new Connection(config.solana.rpcUrl);
    this.whaleThreshold = config.whaleThreshold;
    this.isMonitoring = false;
    this.monitoringIntervals = {
      ethereum: null,
      solana: null
    };
  }

  /**
   * Start monitoring blockchain transactions
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('Monitoring is already active');
      return;
    }

    this.isMonitoring = true;
    console.log('Starting blockchain transaction monitoring');

    // Start Ethereum monitoring
    this.monitoringIntervals.ethereum = setInterval(
      async () => this.monitorEthereumTransactions(),
      config.monitoring.ethereumInterval
    );

    // Start Solana monitoring
    this.monitoringIntervals.solana = setInterval(
      async () => this.monitorSolanaTransactions(),
      config.monitoring.solanaInterval
    );
  }

  /**
   * Stop monitoring blockchain transactions
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('Monitoring is not active');
      return;
    }

    console.log('Stopping blockchain transaction monitoring');
    
    if (this.monitoringIntervals.ethereum) {
      clearInterval(this.monitoringIntervals.ethereum);
      this.monitoringIntervals.ethereum = null;
    }
    
    if (this.monitoringIntervals.solana) {
      clearInterval(this.monitoringIntervals.solana);
      this.monitoringIntervals.solana = null;
    }
    
    this.isMonitoring = false;
  }

  /**
   * Monitor Ethereum transactions for whale movements
   */
  async monitorEthereumTransactions() {
    try {
      const latestBlockNumber = await this.ethereumProvider.eth.getBlockNumber();
      const block = await this.ethereumProvider.eth.getBlock(latestBlockNumber, true);
      
      console.log(`Processing Ethereum block #${latestBlockNumber} with ${block.transactions.length} transactions`);
      
      // Process each transaction in the block
      for (const tx of block.transactions) {
        await this.processEthereumTransaction(tx);
      }
    } catch (error) {
      console.error('Error monitoring Ethereum transactions:', error);
    }
  }

  /**
   * Process an Ethereum transaction and detect whale movements
   * @param {Object} transaction Ethereum transaction object
   */
  async processEthereumTransaction(transaction) {
    try {
      // Check if transaction value exceeds whale threshold
      const valueInEth = this.ethereumProvider.utils.fromWei(transaction.value, 'ether');
      
      if (parseFloat(valueInEth) >= this.whaleThreshold.ethereum) {
        console.log(`Detected whale transaction: ${transaction.hash} - ${valueInEth} ETH`);
        
        // Record whale transaction
        await this.recordWhaleTransaction({
          blockchain: 'ethereum',
          txHash: transaction.hash,
          from: transaction.from,
          to: transaction.to,
          value: valueInEth,
          token: 'ETH',
          timestamp: new Date(),
          blockNumber: transaction.blockNumber
        });
      }
    } catch (error) {
      console.error('Error processing Ethereum transaction:', error);
    }
  }

  /**
   * Monitor Solana transactions for whale movements
   */
  async monitorSolanaTransactions() {
    try {
      const signatures = await this.solanaConnection.getSignaturesForAddress(
        config.solana.monitoredProgramId,
        { limit: 100 }
      );
      
      console.log(`Processing ${signatures.length} Solana transactions`);
      
      // Process each signature
      for (const sig of signatures) {
        await this.processSolanaTransaction(sig.signature);
      }
    } catch (error) {
      console.error('Error monitoring Solana transactions:', error);
    }
  }

  /**
   * Process a Solana transaction and detect whale movements
   * @param {string} signature Solana transaction signature
   */
  async processSolanaTransaction(signature) {
    try {
      const transaction = await this.solanaConnection.getTransaction(signature);
      
      if (!transaction || !transaction.meta) {
        return;
      }
      
      // Analyze transaction for whale movements
      // This is a simplified implementation
      const postBalances = transaction.meta.postBalances;
      const preBalances = transaction.meta.preBalances;
      
      // Calculate SOL transfer amount
      const transferAmount = Math.abs(postBalances[0] - preBalances[0]) / 1e9;
      
      if (transferAmount >= this.whaleThreshold.solana) {
        console.log(`Detected Solana whale transaction: ${signature} - ${transferAmount} SOL`);
        
        // Record whale transaction
        await this.recordWhaleTransaction({
          blockchain: 'solana',
          txHash: signature,
          from: transaction.transaction.message.accountKeys[0].toString(),
          to: transaction.transaction.message.accountKeys[1].toString(),
          value: transferAmount.toString(),
          token: 'SOL',
          timestamp: new Date(),
          blockNumber: transaction.slot
        });
      }
    } catch (error) {
      console.error('Error processing Solana transaction:', error);
    }
  }

  /**
   * Record a whale transaction and generate alerts if needed
   * @param {Object} transactionData Transaction data object
   */
  async recordWhaleTransaction(transactionData) {
    try {
      // Check if the address is a known whale
      const isKnownWhale = await WhaleModel.exists({ address: transactionData.from });
      
      if (!isKnownWhale) {
        // Create new whale profile if not already known
        await WhaleModel.create({
          address: transactionData.from,
          blockchain: transactionData.blockchain,
          firstSeen: new Date(),
          lastActive: new Date(),
          transactionCount: 1
        });
      } else {
        // Update existing whale profile
        await WhaleModel.updateOne(
          { address: transactionData.from },
          {
            $inc: { transactionCount: 1 },
            $set: { lastActive: new Date() }
          }
        );
      }
      
      // Generate alerts for users monitoring this address or token
      await this.generateAlerts(transactionData);
      
    } catch (error) {
      console.error('Error recording whale transaction:', error);
    }
  }

  /**
   * Generate alerts for users based on transaction data
   * @param {Object} transactionData Transaction data object
   */
  async generateAlerts(transactionData) {
    try {
      // Find users who are monitoring this address
      const addressAlerts = await AlertModel.find({
        type: 'address',
        target: transactionData.from,
        isActive: true
      }).populate('user');
      
      // Find users who are monitoring this token
      const tokenAlerts = await AlertModel.find({
        type: 'token',
        target: transactionData.token,
        isActive: true
      }).populate('user');
      
      // Combine unique users from both alert types
      const alerts = [...addressAlerts, ...tokenAlerts];
      
      // Generate notifications for each user
      for (const alert of alerts) {
        console.log(`Generating alert for user ${alert.user.email} - ${transactionData.txHash}`);
        
        // Create notification (implementation would depend on notification system)
        // This could send emails, push notifications, etc.
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  }
}

module.exports = new BlockchainMonitor(); 