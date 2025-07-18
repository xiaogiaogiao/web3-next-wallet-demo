import { createConfig, http } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

//1.定义支持的链
const chains = [mainnet, polygon, bsc];

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

//4.配置Wagmi v2
const wagmiConfig = createConfig({
    chains: [mainnet, polygon, bsc],
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
    },
})

export { wagmiConfig, projectId, chains };

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