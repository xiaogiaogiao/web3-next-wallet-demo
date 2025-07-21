/**
 * 客户端错误处理组件
 * 用于初始化全局错误处理
 */

'use client';

import { useEffect } from 'react';
import { initGlobalErrorHandler } from '../utils/errorHandler';

interface ClientErrorHandlerProps {
  children: React.ReactNode;
}

export function ClientErrorHandler({ children }: ClientErrorHandlerProps) {
  useEffect(() => {
    // 初始化全局错误处理
    initGlobalErrorHandler();
  }, []);

  return <>{children}</>;
} 