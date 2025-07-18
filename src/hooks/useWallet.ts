import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useDisconnect } from 'wagmi';
import { mainnet, polygon, bsc, sepolia } from 'wagmi/chains';

type WalletState = {
  address: string | null;
  balance: string;
  chainId: number | null;
  isConnected: boolean;
  networkName: string;
};

const CHAIN_INFO: Record<number, { name: string }> = {
  1: { name: 'Ethereum' },
  56: { name: 'BNB Chain' },
  137: { name: 'Polygon' },
  11155111: { name: 'Sepolia' }
};

const chains = [mainnet, polygon, bsc, sepolia];

const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: '0',
    chainId: null,
    isConnected: false,
    networkName: ''
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const { disconnect } = useDisconnect();

  // 初始化Provider
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    }
  }, []);

  // 统一状态更新方法
  const updateWalletState = async (provider: ethers.BrowserProvider) => {
    try {
      const accounts = await provider.send('eth_accounts', []);
      const network = await provider.getNetwork();
      if (accounts.length > 0) {
        const balance = await provider.getBalance(accounts[0]);
        setState({
          address: accounts[0],
          balance: ethers.formatEther(balance),
          chainId: Number(network.chainId),
          isConnected: true,
          networkName: CHAIN_INFO[Number(network.chainId)]?.name || `Chain ${network.chainId}`
        });
      } else {
        setState({
          address: null,
          balance: '0',
          chainId: Number(network.chainId),
          isConnected: false,
          networkName: CHAIN_INFO[Number(network.chainId)]?.name || `Chain ${network.chainId}`
        });
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        balance: '0'
      }));
    }
  };

  // 事件监听
  useEffect(() => {
    if (!window.ethereum || !provider) return;

    const handleAccountsChanged = () => updateWalletState(provider);
    const handleChainChanged = () => {
      // 重新初始化 provider 并刷新钱包状态
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
      updateWalletState(newProvider);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // 初始加载
    updateWalletState(provider);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [provider]);

  const connect = async () => {
    if (!provider) return;
    const accounts = await provider.send('eth_requestAccounts', []);
    if (accounts.length > 0) {
      await updateWalletState(provider);
    }
  };

  // ETH转账
  const sendTransaction = async (to: string, amount: string): Promise<string> => {
    if (!provider) throw new Error('Provider not initialized');
    if (!state.address) throw new Error('Wallet not connected');
    if (!ethers.isAddress(to)) throw new Error('接收地址无效');
    const value = ethers.parseEther(amount);
    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      to,
      value
    });
    return tx.hash;
  };

  const disconnectWallet = async () => {
    setState({
      address: null,
      balance: '0',
      chainId: null,
      isConnected: false,
      networkName: ''
    });
  };

  return { ...state, connect, provider, sendTransaction };
};

export default useWallet;