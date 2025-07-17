import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

type WalletState = {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
};

const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: '0',
    chainId: null,
    isConnected: false,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // 只在浏览器环境下初始化本地 state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('web3-wallet-state');
      if (saved) {
        setState(JSON.parse(saved));
      }
    }
  }, []);

  // 统一状态更新方法
  const updateWalletState = (updates: Partial<WalletState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      if (typeof window !== "undefined") {
        localStorage.setItem('web3-wallet-state', JSON.stringify(newState));
      }
      return newState;
    });
  };

  // 初始化Provider和事件监听
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const initProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(initProvider);
      console.log("initProvider:",ethers);
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        updateWalletState({
          address: null,
          balance: '0',
          isConnected: false
        });
      } else {
        updateWalletState({
          address: accounts[0],
          isConnected: true
        });
        initProvider.getBalance(accounts[0])
          .then(bal => updateWalletState({
            balance: ethers.formatEther(bal)
          }));
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    // 初始加载时检查连接状态
    initProvider.send('eth_accounts', [])
      .then(accounts => {
        if (accounts.length > 0) handleAccountsChanged(accounts);
      });

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connect = async () => {
    if (!provider) return;
    
    try {
        // 请求用户授权
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        // 更新状态
        updateWalletState({
          address: accounts[0],
          isConnected: true
        });
        // 获取链ID
        const bal = await provider.getBalance(accounts[0]);
        const chainId = await provider.getNetwork().then(network => network.chainId);
        updateWalletState({
          chainId: await provider.getNetwork().then(net => net.chainId)
        });
       
        updateWalletState({
          balance: ethers.formatEther(bal)
        });
      }
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  };

  return { ...state, connect, provider };
};

export default useWallet;