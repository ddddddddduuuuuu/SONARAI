/**
 * Application Configuration
 */

require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 5000,
    socketPort: process.env.SOCKET_PORT || 5001,
    environment: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'sonar-secret-key',
    jwtExpiration: '24h'
  },

  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sonar',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      options: {}
    }
  },

  ethereum: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'https://mainnet.infura.io/v3/your_infura_key',
    wsUrl: process.env.BLOCKCHAIN_WS_URL || 'wss://mainnet.infura.io/ws/v3/your_infura_key',
    contractAddresses: {
      // Add known contract addresses here
    }
  },

  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    wsUrl: process.env.SOLANA_WS_URL || 'wss://api.mainnet-beta.solana.com',
    monitoredProgramId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  },

  monitoring: {
    ethereumInterval: 15000, // 15 seconds
    solanaInterval: 10000, // 10 seconds
    maxTransactionsPerFetch: 1000
  },

  whaleThreshold: {
    ethereum: 100, // 100 ETH
    solana: 1000, // 1000 SOL
    // Add other tokens as needed
  },

  alerts: {
    types: ['address', 'token', 'pattern', 'volume'],
    channels: ['app', 'email', 'telegram'],
    maxPerUser: {
      free: 5,
      basic: 20,
      premium: 50
    }
  },

  email: {
    from: 'alerts@sonar.tel',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password'
      }
    }
  },

  subscriptions: {
    tiers: {
      free: {
        price: 0,
        features: ['basic_alerts', 'daily_report']
      },
      basic: {
        price: 9.99,
        features: ['real_time_alerts', 'custom_watchlists', 'token_insights']
      },
      premium: {
        price: 29.99,
        features: ['advanced_alerts', 'api_access', 'predictive_signals', 'priority_support']
      }
    }
  },

  analytics: {
    retentionPeriod: {
      transactionData: 90, // days
      alerts: 30, // days
      userActivity: 180 // days
    }
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/sonar.log'
  }
}; 