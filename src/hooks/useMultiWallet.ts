import { useAccount, useDisconnect, useBalance, useConnect } from 'wagmi';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const useMultiWallet = () => {
    const { address, isConnected, connector } = useAccount();
    const { disconnect } = useDisconnect();
    const { connect: wagmiConnect, connectors } = useConnect();
    const { data: balance } = useBalance({
        address: address,
    });

    // 统一连接方法
    const connect = async (walletType: 'metamask' | 'walletconnect') => {
        if (walletType === 'metamask') {
            // 使用Wagmi的injected连接器
            const injectedConnector = connectors.find(c => c.id === 'injected');
            if (injectedConnector) {
                await wagmiConnect({ connector: injectedConnector });
            }
        } else {
            // 使用Wagmi的WalletConnect连接器
            const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');
            if (walletConnectConnector) {
                await wagmiConnect({ connector: walletConnectConnector });
            }
        }
    };

    const getWalletInfo = () => {
        if (!isConnected || !address) return null;
        
        return {
            address,
            balance: balance ? ethers.formatEther(balance.value) : '0',
            connector: connector?.name || 'Unknown'
        };
    };

    return { 
        connect, 
        disconnect, 
        isConnected, 
        address,
        balance: balance ? ethers.formatEther(balance.value) : '0',
        getWalletInfo 
    };
};