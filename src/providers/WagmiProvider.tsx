'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicWagmiConfig } from './WalletConnectProvider';
import { useState, useEffect } from 'react';

export function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

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

    if (!mounted) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                初始化中...
            </div>
        );
    }

    return (
        <DynamicWagmiConfig>
            <QueryClientProvider client={queryClient}>
                <p style={{color: '#888', fontSize: 14}}>
                    连接钱包时请在弹出的钱包窗口或手机App内点击"确认"完成连接，否则会报错。
                </p>
                {children}
            </QueryClientProvider>
        </DynamicWagmiConfig>
    );
} 