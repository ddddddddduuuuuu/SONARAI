import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { 
  FiSearch, FiAlertTriangle, FiActivity, 
  FiBarChart2, FiShield, FiUsers 
} from 'react-icons/fi';
import Dashboard from '../components/Dashboard';

const Home: React.FC = () => {
  return (
    <div>
      <Head>
        <title>SONAR - AI Intelligence Officer for Blockchain Transactions</title>
        <meta name="description" content="Real-time blockchain whale activity monitoring and intelligent alerts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/images/logo.png" alt="SONAR Logo" className="h-10 mr-4" />
            <h1 className="text-2xl font-bold">SONAR</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li className="font-medium">Dashboard</li>
              <li>
                <a href="#" className="hover:text-blue-200 transition">Whale Radar</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-200 transition">Market Intel</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-200 transition">Settings</a>
              </li>
            </ul>
          </nav>
          <div>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition">
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      <main>
        <Dashboard />
      </main>

      <footer className="bg-gray-100 border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">SONAR</h3>
              <p className="text-sm text-gray-600">
                Your AI Intelligence Officer for Blockchain Transactions
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">API</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition">Twitter</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Telegram</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} SONAR. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 