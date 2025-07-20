'use client';

import "@/styles/globals.css";
import "@/styles/WalletSelector.css";
import { useEffect, useState } from 'react';
import useWallet from '@/hooks/useWallet';
import SendEthForm from '@/components/SendEthForm';
import TopNav from '@/components/TopNav';
import WalletModal from '@/components/WalletModal';

export default function Home() {
  const { address, balance, chainId, networkName, isConnected, connect } = useWallet();
  const [showWallet, setShowWallet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="wallet-container">
        <h1>Web3 多钱包连接演示</h1>
        <div className="connect-section">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            加载中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopNav onWalletClick={() => setShowWallet(true)} />
      <div style={{ paddingTop: 80, minHeight: '100vh' }}>
        <h1 style={{ textAlign: 'center', marginTop: 40, color: '#222' }}>
          欢迎体验 Web3 多钱包连接演示
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: 40 }}>
          点击右上角"钱包"按钮进行连接和转账
        </p>
        
        <div style={{ textAlign: 'center' }}>
          <a 
            href="/trading" 
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            进入实时交易页面
          </a>
        </div>
      </div>
      <WalletModal open={showWallet} onClose={() => setShowWallet(false)} />
    </div>
  );
}