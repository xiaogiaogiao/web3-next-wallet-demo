 /**
 * 测试页面
 * 用于验证合约调用功能
 */

'use client';

import React, { useState } from 'react';
import { useContract } from '../../hooks/useContract';
import { getTokenAddress } from '../../hooks/useContract';
import TopNav from '../../components/TopNav';

export default function TestPage() {
  const [contractAddress, setContractAddress] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  const { getTokenInfo, getTokenBalance, getAllowance, loading, error } = useContract(contractAddress);

  const addTestResult = (testName: string, result: any, success: boolean) => {
    setTestResults(prev => [...prev, {
      name: testName,
      result,
      success,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testUSDT = async () => {
    try {
      const usdtAddress = getTokenAddress('ethereum', 'USDT');
      if (!usdtAddress) {
        addTestResult('获取USDT地址', '地址不存在', false);
        return;
      }

      setContractAddress(usdtAddress);
      const info = await getTokenInfo(usdtAddress);
      addTestResult('USDT信息查询', info, true);
    } catch (err) {
      addTestResult('USDT信息查询', err, false);
    }
  };

  const testCustomAddress = async () => {
    if (!contractAddress) {
      addTestResult('自定义地址测试', '请输入合约地址', false);
      return;
    }

    try {
      const info = await getTokenInfo(contractAddress);
      addTestResult('自定义地址信息查询', info, true);
    } catch (err) {
      addTestResult('自定义地址信息查询', err, false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav onWalletClick={() => {}} />
      
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">合约调用测试</h1>

        {/* 测试控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                合约地址
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={testUSDT}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                测试USDT
              </button>
              
              <button
                onClick={testCustomAddress}
                disabled={loading || !contractAddress}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                测试自定义地址
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                清除结果
              </button>
            </div>
          </div>
        </div>

        {/* 错误显示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <h3 className="text-sm font-medium text-red-800 mb-1">错误</h3>
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        {/* 测试结果 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500">暂无测试结果</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-md border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.name}
                    </h3>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  <div className="text-sm">
                    {result.success ? (
                      <pre className="whitespace-pre-wrap text-green-700">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-red-700">{String(result.result)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">使用说明</h2>
          <ul className="space-y-2 text-blue-700">
            <li>• 点击"测试USDT"按钮测试以太坊主网的USDT代币</li>
            <li>• 在输入框中输入自定义合约地址进行测试</li>
            <li>• 查看测试结果了解合约调用的成功与失败情况</li>
            <li>• 使用"清除结果"按钮清空测试历史</li>
          </ul>
        </div>
      </div>
    </div>
  );
}