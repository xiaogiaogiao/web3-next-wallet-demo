import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WagmiProviderWrapper } from "@/providers/WagmiProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web3 多钱包连接演示",
  description: "支持MetaMask和WalletConnect的多链钱包连接演示",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 全局错误处理器 - 处理浏览器扩展注入的脚本错误
              (function() {
                // 需要忽略的错误模式
                const IGNORED_PATTERNS = [
                  /tipDiv.*already been declared/i,
                  /Identifier 'tipDiv' has already been declared/i,
                  /VM\\d+.*tipDiv/i,
                  /browser.*extension/i,
                  /chrome.*extension/i,
                  /moz.*extension/i,
                  /safari.*extension/i,
                ];
                
                // 检查错误是否应该被忽略
                function shouldIgnoreError(message, filename) {
                  // 检查错误消息模式
                  for (const pattern of IGNORED_PATTERNS) {
                    if (pattern.test(message)) {
                      return true;
                    }
                  }
                  
                  // 检查文件名模式
                  if (filename && (
                    filename.includes('chrome-extension://') || 
                    filename.includes('moz-extension://') ||
                    filename.includes('safari-extension://') ||
                    (filename.includes('VM') && filename.includes('main.js'))
                  )) {
                    return true;
                  }
                  
                  return false;
                }
                
                // 保存原始的console.error
                const originalConsoleError = console.error;
                
                // 重写console.error来过滤错误
                console.error = function(...args) {
                  const message = args.join(' ');
                  
                  if (message.includes('tipDiv') && message.includes('already been declared')) {
                    console.warn('🔇 忽略浏览器扩展注入的tipDiv错误');
                    return;
                  }
                  
                  originalConsoleError.apply(console, args);
                };
                
                // 监听全局错误
                window.addEventListener('error', function(event) {
                  if (shouldIgnoreError(event.message, event.filename)) {
                    console.warn('🔇 忽略浏览器扩展错误:', event.message);
                    event.preventDefault();
                    return false;
                  }
                }, true);
                
                // 监听未处理的Promise拒绝
                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason;
                  if (reason && (
                    reason.message && reason.message.includes('tipDiv') ||
                    reason.toString && reason.toString().includes('tipDiv')
                  )) {
                    console.warn('🔇 忽略浏览器扩展Promise拒绝');
                    event.preventDefault();
                    return;
                  }
                });
                
                // 监听语法错误
                window.addEventListener('error', function(event) {
                  if (event.error && event.error.name === 'SyntaxError') {
                    const message = event.error.message || '';
                    if (message.includes('tipDiv') && message.includes('already been declared')) {
                      console.warn('🔇 忽略tipDiv语法错误 (浏览器扩展)');
                      event.preventDefault();
                      return false;
                    }
                  }
                }, true);
                
                console.log('✅ 全局错误处理器已初始化');
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <WagmiProviderWrapper>
            {children}
          </WagmiProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
