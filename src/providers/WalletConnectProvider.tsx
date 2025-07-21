'use client';

import { createConfig, http, WagmiProvider } from 'wagmi'
import { mainnet, polygon, bsc, sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { useEffect, useState } from 'react'

//1.定义支持的链
const chains = [mainnet, polygon, bsc, sepolia];

//2.配置钱包连接项目ID(从walletConnect官网获取)
// 注意：请替换为你的真实Project ID

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "348ce4f62a7e2f3432eb97d44a4b753c";

//3.创建WalletConnect提供商配置
const metadata = {
    name: "Web3 多钱包连接演示",
    description: "支持MetaMask和WalletConnect的多链钱包连接演示",
    url: "http://localhost:3000",
    icons: ["https://avatars.githubusercontent.com/u/37784886"]
}

//4.配置Wagmi v2 - 使用动态配置避免SSR问题
function createWagmiConfig() {
    return createConfig({
        chains: chains as any,
        connectors: [
            injected(),
            walletConnect({ 
                projectId,
                metadata,
                showQrModal: true, // 启用QR码显示
                qrModalOptions: {
                    themeMode: 'dark',
                    themeVariables: {
                        '--wcm-z-index': '9999'
                    }
                }
            })
        ],
        transports: {
            [mainnet.id]: http(),
            [polygon.id]: http(),
            [bsc.id]: http(),
            [sepolia.id]: http(),
        },
    })
}

// 动态配置组件 - 只在客户端渲染
export function DynamicWagmiConfig({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 确保只在客户端执行
        if (typeof window !== 'undefined') {
            setIsClient(true);
            
            try {
                const wagmiConfig = createWagmiConfig();
                setConfig(wagmiConfig);
            } catch (err) {
                console.error('WalletConnect配置错误:', err);
                setError(err instanceof Error ? err.message : '配置失败');
            }
        }
    }, []);

    // 服务器端渲染时显示加载状态
    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在初始化钱包连接...</p>
                </div>
            </div>
        );
    }

    // 配置错误时显示错误信息
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">
                        WalletConnect 配置错误
                    </h1>
                    <p className="text-gray-600 mb-4">
                        {error}
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
                        <p><strong>解决方案：</strong></p>
                        <ul className="mt-2 space-y-1">
                            <li>• 检查网络连接</li>
                            <li>• 确认项目ID是否正确</li>
                            <li>• 尝试刷新页面</li>
                            <li>• 检查防火墙设置</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        刷新页面
                    </button>
                </div>
            </div>
        );
    }

    // 配置加载中
    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在配置钱包连接...</p>
                </div>
            </div>
        );
    }

    return (
        <WagmiProvider config={config}>
            {children}
        </WagmiProvider>
    );
}

export { projectId, chains };

try {
  // ... existing code ...
} catch (err) {
  let msg = '连接失败';
  if (err instanceof Error) {
    if (err.message.includes('User rejected')) {
      msg = '连接被用户拒绝，请在钱包内点击"确认"或重试。';
    } else {
      msg = err.message;
    }
  }
  alert(msg);
}