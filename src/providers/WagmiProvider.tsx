'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './WalletConnectProvider';
import { useState, useEffect } from 'react';

export function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    });

    const handleConnect = async (connector: any) => {
        try {
            setConnectingWallet(connector.name);
            await connect({ connector });
        } catch (err) {
            // ...错误处理...
        } finally {
            setConnectingWallet(null);
        }
    };

    if (!mounted) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                初始化中...
            </div>
        );
    }

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <p style={{color: '#888', fontSize: 14}}>
                    连接钱包时请在弹出的钱包窗口或手机App内点击"确认"完成连接，否则会报错。
                </p>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
} 