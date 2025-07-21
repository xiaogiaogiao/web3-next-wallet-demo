/**
 * 调试页面
 * 用于测试错误处理功能
 */

'use client';

import React, { useState } from 'react';
import TopNav from '../../components/TopNav';
import { NetworkTest } from '../../components/NetworkTest';

export default function DebugPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testErrorHandling = () => {
    addResult('开始测试错误处理...');
    
    // 模拟tipDiv错误
    try {
      // 这个错误应该被我们的错误处理器捕获
      eval('var tipDiv = 1; var tipDiv = 2;');
      addResult('tipDiv错误处理测试完成');
    } catch (error) {
      addResult(`捕获到错误: ${error}`);
    }
  };

  const testContractCall = async () => {
    addResult('开始测试合约调用...');
    
    try {
      // 模拟合约调用
      const response = await fetch('/api/test');
      addResult(`合约调用测试完成: ${response.status}`);
    } catch (error) {
      addResult(`合约调用错误: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav onWalletClick={() => {}} />
      
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">调试页面</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">错误处理测试</h2>
          
          <div className="space-y-4">
            <button
              onClick={testErrorHandling}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              测试错误处理
            </button>
            
            <button
              onClick={testContractCall}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              测试合约调用
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              清除结果
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500">暂无测试结果</p>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">说明</h2>
          <ul className="space-y-2 text-blue-700">
            <li>• 点击"测试错误处理"按钮来测试tipDiv错误处理</li>
            <li>• 点击"测试合约调用"按钮来测试合约调用功能</li>
            <li>• 查看控制台了解错误处理的详细信息</li>
            <li>• 如果看到"Ignoring tipDiv redeclaration error"说明错误处理正常工作</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 