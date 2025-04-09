import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { 
  FiSearch, FiAlertTriangle, FiActivity, 
  FiBarChart2, FiShield, FiUsers 
} from 'react-icons/fi';

export default function Home() {
  return (
    <>
      <Head>
        <title>SONAR - 区块链交易的AI情报官</title>
        <meta name="description" content="SONAR通过AI技术实时追踪Solana链上的交易大户动向和资金流向，提供智能化的市场预警和交易信号。" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header className="bg-background-dark">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-3xl font-display text-primary font-bold">
                SONAR
                <span className="inline-block ml-2 relative">
                  <span className="animate-sonar-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-text-muted hover:text-primary transition-colors">
                示例演示
              </Link>
              <Link href="/#features" className="text-text-muted hover:text-primary transition-colors">
                特色功能
              </Link>
              <Link href="/login" className="btn btn-outline">
                登录
              </Link>
              <Link href="/register" className="btn btn-primary">
                注册
              </Link>
            </div>
          </div>
        </header>

        <section className="py-20 bg-background-dark">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-primary">Blockchain Transaction</span><br />AI Intelligence Officer
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10">
              Real-time monitoring of whale behavior, capturing market trends, providing intelligent alerts, helping you stay ahead in capturing trading opportunities.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register" className="btn btn-primary px-8 py-3">
                Try for Free
              </Link>
              <Link href="/dashboard" className="btn btn-outline px-8 py-3">
                View Demo
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
              Core Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="card hover:shadow-xl transition-all">
                <div className="mb-4 text-primary text-3xl">
                  <FiSearch />
                </div>
                <h3 className="text-xl font-bold mb-2">Whale Radar</h3>
                <p className="text-text-muted">
                  Real-time tracking of large wallet activities and capital flows, intelligent analysis of whale behavior patterns.
                </p>
              </div>
              
              <div className="card hover:shadow-xl transition-all">
                <div className="mb-4 text-accent text-3xl">
                  <FiAlertTriangle />
                </div>
                <h3 className="text-xl font-bold mb-2">Alert System</h3>
                <p className="text-text-muted">
                  Provides real-time warnings of abnormal capital flows and concentrated operations by whales, avoiding missing key market signals.
                </p>
              </div>
              
              <div className="card hover:shadow-xl transition-all">
                <div className="mb-4 text-secondary text-3xl">
                  <FiActivity />
                </div>
                <h3 className="text-xl font-bold mb-2">Market Intelligence Dashboard</h3>
                <p className="text-text-muted">
                  Hot token rankings and whale attention analysis, grasping market pulse and investment hotspots.
                </p>
              </div>
              
              <div className="card hover:shadow-xl transition-all">
                <div className="mb-4 text-green-500 text-3xl">
                  <FiBarChart2 />
                </div>
                <h3 className="text-xl font-bold mb-2">Custom Strategies</h3>
                <p className="text-text-muted">
                  Create personalized monitoring strategies based on your investment preferences and risk tolerance.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-background-light">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              准备好领先市场一步了吗？
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10">
              加入SONAR，获取AI驱动的区块链交易情报，把握市场机会。
            </p>
            <Link href="/register" className="btn btn-primary px-8 py-3">
              立即注册
            </Link>
          </div>
        </section>

        <footer className="bg-background-dark py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-display text-primary font-bold">SONAR</h2>
                <p className="text-text-muted mt-2">区块链交易的AI情报官</p>
              </div>
              
              <div className="flex space-x-8">
                <Link href="/about" className="text-text-muted hover:text-primary transition-colors">
                  关于我们
                </Link>
                <Link href="/faq" className="text-text-muted hover:text-primary transition-colors">
                  常见问题
                </Link>
                <Link href="/terms" className="text-text-muted hover:text-primary transition-colors">
                  服务条款
                </Link>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-background-light text-center text-text-dark">
              <p>© {new Date().getFullYear()} SONAR. 保留所有权利。</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
} 