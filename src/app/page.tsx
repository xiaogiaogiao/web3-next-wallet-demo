"use client";

import "@/styles/globals.css";
import "@/styles/WalletSelector.css";
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';
import { useWalletEvents } from '@/hooks/useWalletEvents';

export default function Home() {
    const { address, isConnected, connector } = useAccount();
    const { connect, connectors, isPending, error } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: balance } = useBalance({
        address: address,
    });
    const [mounted, setMounted] = useState(false);
    const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

    // 使用钱包事件hook
    useWalletEvents();

    // 防止SSR问题
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleConnect = async (connector: any) => {
        try {
            setConnectingWallet(connector.name);
            await connect({ connector });
        } catch (err) {
            console.error('连接失败:', err);
            alert(`连接失败: ${err instanceof Error ? err.message : '未知错误'}`);
        } finally {
            setConnectingWallet(null);
        }
    };

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
        <div className="wallet-container">
            <h1>Web3 多钱包连接演示</h1>
            
            {error && (
                <div className="error-message">
                    <p>连接错误: {error.message}</p>
                </div>
            )}
            
            {isConnected ? (
                <div className="wallet-info">
                    <h2>🌐 已连接钱包</h2>
                    <p>地址: {address}</p>
                    <p>余额: {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '加载中...'}</p>
                    <p>连接器: {connector?.name || '未知'}</p>
                    <button onClick={() => disconnect()}>断开连接</button>
                </div>
            ) : (
                <div className="connect-section">
                    <h2>选择钱包连接</h2>
                    <div className="wallet-grid">
                        {connectors.map((connector) => (
                            <button
                                key={connector.id}
                                onClick={() => handleConnect(connector)}
                                className="wallet-button"
                                disabled={isPending || !!connectingWallet}
                            >
                                <span className="wallet-icon">
                                    {connector.id === 'injected' ? '🦊' : '🔗'}
                                </span>
                                {connector.name}
                                {(isPending || connectingWallet === connector.name) && (
                                    <div className="loading-spinner"></div>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="wallet-tips">
                        <p>💡 提示:</p>
                        <ul>
                            <li>MetaMask: 需要安装MetaMask浏览器扩展</li>
                            <li>WalletConnect: 支持移动端钱包，扫描QR码连接</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
} 