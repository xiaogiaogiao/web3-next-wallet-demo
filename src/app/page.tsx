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
        <p style={{ textAlign: 'center', color: '#888' }}>
          点击右上角"钱包"按钮进行连接和转账
        </p>
      </div>
      <WalletModal open={showWallet} onClose={() => setShowWallet(false)} />
    </div>
  );
}