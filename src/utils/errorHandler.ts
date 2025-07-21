/**
 * 全局错误处理工具
 */

/**
 * 初始化全局错误处理
 */
export function initGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  // 处理未捕获的JavaScript错误
  window.addEventListener('error', (event) => {
    // 忽略tipDiv重复声明错误（通常来自浏览器扩展）
    if (event.message.includes('tipDiv') && event.message.includes('already been declared')) {
      console.warn('Ignoring tipDiv redeclaration error (likely from browser extension)');
      event.preventDefault();
      return;
    }

    // 忽略其他已知的外部脚本错误
    if (event.filename && (
      event.filename.includes('chrome-extension') ||
      event.filename.includes('moz-extension') ||
      event.filename.includes('safari-extension')
    )) {
      console.warn('Ignoring browser extension error:', event.message);
      event.preventDefault();
      return;
    }

    console.error('Global error caught:', event);
  });

  // 处理未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    // 忽略WalletConnect相关的SSR错误
    if (event.reason && event.reason.message && 
        event.reason.message.includes('indexedDB is not defined')) {
      console.warn('Ignoring WalletConnect SSR error');
      event.preventDefault();
      return;
    }

    console.error('Unhandled promise rejection:', event.reason);
  });
}

/**
 * 安全的函数执行包装器
 */
export function safeExecute<T>(fn: () => T, fallback?: T): T | undefined {
  try {
    return fn();
  } catch (error) {
    console.error('Safe execute error:', error);
    return fallback;
  }
}

/**
 * 异步函数的安全执行包装器
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>, 
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    console.error('Safe execute async error:', error);
    return fallback;
  }
} 