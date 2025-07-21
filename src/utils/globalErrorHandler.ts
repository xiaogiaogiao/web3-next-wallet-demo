/**
 * 全局错误处理器
 * 专门处理浏览器扩展注入的脚本错误
 */

// 错误类型定义
interface ErrorInfo {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
}

// 需要忽略的错误模式
const IGNORED_ERROR_PATTERNS = [
  /tipDiv.*already been declared/i,
  /Identifier 'tipDiv' has already been declared/i,
  /VM\d+.*tipDiv/i,
  /browser.*extension/i,
  /chrome.*extension/i,
  /moz.*extension/i,
  /safari.*extension/i,
];

// 需要忽略的Promise拒绝模式
const IGNORED_REJECTION_PATTERNS = [
  /tipDiv/i,
  /extension/i,
  /browser.*extension/i,
];

/**
 * 检查错误是否应该被忽略
 */
function shouldIgnoreError(error: ErrorInfo): boolean {
  const message = error.message || '';
  const filename = error.filename || '';
  
  // 检查错误消息模式
  for (const pattern of IGNORED_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return true;
    }
  }
  
  // 检查文件名模式（扩展脚本通常有特定模式）
  if (filename.includes('chrome-extension://') || 
      filename.includes('moz-extension://') ||
      filename.includes('safari-extension://') ||
      filename.includes('VM') && filename.includes('main.js')) {
    return true;
  }
  
  return false;
}

/**
 * 检查Promise拒绝是否应该被忽略
 */
function shouldIgnoreRejection(reason: any): boolean {
  if (!reason) return false;
  
  const message = reason.message || reason.toString() || '';
  
  for (const pattern of IGNORED_REJECTION_PATTERNS) {
    if (pattern.test(message)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 初始化全局错误处理
 */
export function initGlobalErrorHandler(): void {
  // 只在客户端执行
  if (typeof window === 'undefined') return;
  
  // 保存原始的console.error
  const originalConsoleError = console.error;
  
  // 重写console.error来过滤错误
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // 检查是否是tipDiv相关错误
    if (message.includes('tipDiv') && message.includes('already been declared')) {
      console.warn('🔇 忽略浏览器扩展注入的tipDiv错误');
      return;
    }
    
    // 其他错误正常输出
    originalConsoleError.apply(console, args);
  };
  
  // 监听全局错误
  window.addEventListener('error', (event) => {
    if (shouldIgnoreError({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    })) {
      console.warn('🔇 忽略浏览器扩展错误:', event.message);
      event.preventDefault();
      return false;
    }
  }, true);
  
  // 监听未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    if (shouldIgnoreRejection(event.reason)) {
      console.warn('🔇 忽略浏览器扩展Promise拒绝:', event.reason);
      event.preventDefault();
      return;
    }
  });
  
  // 监听语法错误
  window.addEventListener('error', (event) => {
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
}

/**
 * 手动处理错误
 */
export function handleError(error: Error | string): void {
  const message = typeof error === 'string' ? error : error.message;
  
  if (shouldIgnoreError({ message })) {
    console.warn('🔇 忽略错误:', message);
    return;
  }
  
  console.error('❌ 处理错误:', error);
}

/**
 * 检查是否是扩展注入的错误
 */
export function isExtensionError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : error.message;
  return shouldIgnoreError({ message });
}

/**
 * 获取错误统计信息
 */
export function getErrorStats(): {
  ignored: number;
  total: number;
} {
  // 这里可以添加错误统计逻辑
  return {
    ignored: 0,
    total: 0,
  };
} 