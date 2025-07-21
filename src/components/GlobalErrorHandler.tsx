/**
 * 全局错误处理组件
 * 专门处理外部脚本错误，如tipDiv重复声明
 */

'use client';

import { useEffect } from 'react';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  useEffect(() => {
    // 处理tipDiv重复声明错误
    const handleError = (event: ErrorEvent) => {
      // 检查是否是tipDiv重复声明错误
      if (event.message.includes('tipDiv') && event.message.includes('already been declared')) {
        console.warn('Ignoring tipDiv redeclaration error (likely from browser extension)');
        event.preventDefault();
        return false;
      }

      // 检查是否是其他已知的外部脚本错误
      if (event.filename && (
        event.filename.includes('chrome-extension') ||
        event.filename.includes('moz-extension') ||
        event.filename.includes('safari-extension') ||
        event.filename.includes('edge-extension')
      )) {
        console.warn('Ignoring browser extension error:', event.message);
        event.preventDefault();
        return false;
      }

      // 检查是否是VM脚本错误（通常来自外部注入）
      if (event.filename && event.filename.includes('VM')) {
        console.warn('Ignoring VM script error:', event.message);
        event.preventDefault();
        return false;
      }

      return true;
    };

    // 处理未处理的Promise拒绝
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // 忽略WalletConnect相关的SSR错误
      if (event.reason && event.reason.message && 
          event.reason.message.includes('indexedDB is not defined')) {
        console.warn('Ignoring WalletConnect SSR error');
        event.preventDefault();
        return;
      }

      // 忽略tipDiv相关的Promise错误
      if (event.reason && event.reason.message && 
          event.reason.message.includes('tipDiv')) {
        console.warn('Ignoring tipDiv-related promise rejection');
        event.preventDefault();
        return;
      }

      console.error('Unhandled promise rejection:', event.reason);
    };

    // 添加事件监听器
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // 清理函数
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
} 