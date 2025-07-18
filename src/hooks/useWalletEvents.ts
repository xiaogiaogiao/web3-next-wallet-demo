import { useEffect } from 'react';
import { useAccount } from 'wagmi';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const useWalletEvents = () => {
    const { address, isConnected } = useAccount();

    useEffect(() => {
        if (typeof window === 'undefined' || !window.ethereum) return;

        const handleAccountsChanged = (accounts: string[]) => {
            console.log('账户变化:', accounts);
            if (accounts.length === 0) {
                // 用户断开了钱包
                console.log('钱包已断开');
            } else {
                // 用户切换了账户
                console.log('切换到账户:', accounts[0]);
            }
        };

        const handleChainChanged = (chainId: string) => {
            console.log('链变化:', chainId);
            // 重新加载页面以确保状态同步
            window.location.reload();
        };

        const handleDisconnect = () => {
            console.log('钱包断开连接');
        };

        // 添加事件监听器
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', handleDisconnect);

        // 清理函数
        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
            window.ethereum?.removeListener('disconnect', handleDisconnect);
        };
    }, [address, isConnected]);

    return { address, isConnected };
}; 