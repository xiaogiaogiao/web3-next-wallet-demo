/**
 * 错误边界组件
 * 用于捕获和处理JavaScript错误
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              出现错误
            </h1>
            <p className="text-gray-600 mb-4">
              应用程序遇到了一个错误。请刷新页面重试。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              刷新页面
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  错误详情 (开发模式)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 客户端错误处理Hook
 */
export function useErrorHandler() {
  const handleError = (error: Error) => {
    console.error('Caught error:', error);
    
    // 如果是tipDiv重复声明错误，忽略它
    if (error.message.includes('tipDiv') && error.message.includes('already been declared')) {
      console.warn('Ignoring tipDiv redeclaration error (likely from browser extension)');
      return;
    }
    
    // 其他错误可以在这里处理
  };

  return { handleError };
} 