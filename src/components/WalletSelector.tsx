import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useState } from 'react';
import '@/styles/WalletSelector.css';

export default function WalletSelector() {
    const { connect, disconnect, isConnected, address, balance } = useMultiWallet();
    const [loading, setLoading] = useState<string | null>(null);

    const wallets = [
        {
            id: 'metamask',
            name: 'MetaMask',
            icon: '🦊',
            handler: () => handleConnect('metamask')
        },
        {
            id: 'walletconnect',
            name: 'WalletConnect',
            icon: '🔗',
            handler: () => handleConnect('walletconnect')
        }
    ];

    const handleConnect = async (type: string) => {
        setLoading(type);
        try {
            await connect(type as 'metamask' | 'walletconnect');
        } catch (error) {
            alert(`连接失败：${error}`);
        } finally {
            setLoading(null);
        }
    };

    const handleDisconnect = () => {
        disconnect();
    };

    if (isConnected) {
        return (
            <div className="wallet-info">
                <h3>已连接钱包</h3>
                <p>地址: {address}</p>
                <p>余额: {balance} ETH</p>
                <button onClick={handleDisconnect} className="disconnect-btn">
                    断开连接
                </button>
            </div>
        );
    }

    return (
        <div className="wallet-grid">
            {wallets.map(wallet => (
                <button
                    key={wallet.id}
                    onClick={wallet.handler}
                    disabled={!!loading}
                    className="wallet-button"
                >
                    <span className="wallet-icon">{wallet.icon}</span>
                    {wallet.name}
                    {loading === wallet.id && <span className="spinner" />}
                </button>
            ))}
        </div>
    );
}