 /**
 * 代币信息展示组件
 * 展示ERC20代币的基本信息和余额
 */

'use client';

import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { getTokenAddress, getTestnetTokenAddress } from '../hooks/useContract';
import { TOKEN_ADDRESSES, TESTNET_TOKEN_ADDRESSES } from '../constants/contracts';

interface TokenInfoProps {
  contractAddress?: string;
  network?: string;
  tokenName?: string;
}

/**
 * 代币信息展示组件
 * @param props 组件属性
 * @returns JSX元素
 */
export default function TokenInfo({ 
  contractAddress, 
  network = 'ethereum', 
  tokenName 
}: TokenInfoProps) {
  const [selectedNetwork, setSelectedNetwork] = useState(network);
  const [selectedToken, setSelectedToken] = useState(tokenName || 'USDT');
  const [customAddress, setCustomAddress] = useState(contractAddress || '');
  const [isCustomAddress, setIsCustomAddress] = useState(!contractAddress);

  // 获取当前使用的合约地址
  const currentContractAddress = isCustomAddress 
    ? customAddress 
    : getTokenAddress(selectedNetwork, selectedToken) || 
      getTestnetTokenAddress(selectedNetwork, selectedToken) ||
      '';

  // 使用合约hook
  const { loading, error, tokenInfo, loadTokenInfo } = useContract(currentContractAddress);

  /**
   * 处理网络切换
   */
  const handleNetworkChange = (newNetwork: string) => {
    setSelectedNetwork(newNetwork);
    setIsCustomAddress(false);
  };

  /**
   * 处理代币切换
   */
  const handleTokenChange = (newToken: string) => {
    setSelectedToken(newToken);
    setIsCustomAddress(false);
  };

  /**
   * 处理自定义地址输入
   */
  const handleCustomAddressChange = (address: string) => {
    setCustomAddress(address);
    setIsCustomAddress(true);
  };

  /**
   * 刷新代币信息
   */
  const handleRefresh = () => {
    loadTokenInfo();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">代币信息查询</h2>
      
      {/* 网络选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择网络
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(TOKEN_ADDRESSES).map((net) => (
            <button
              key={net}
              onClick={() => handleNetworkChange(net)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedNetwork === net
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {net.charAt(0).toUpperCase() + net.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 代币选择 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择代币
        </label>
        <div className="grid grid-cols-2 gap-2">
          {selectedNetwork && TOKEN_ADDRESSES[selectedNetwork as keyof typeof TOKEN_ADDRESSES] && 
            Object.keys(TOKEN_ADDRESSES[selectedNetwork as keyof typeof TOKEN_ADDRESSES]).map((token) => (
              <button
                key={token}
                onClick={() => handleTokenChange(token)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedToken === token && !isCustomAddress
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {token}
              </button>
            ))}
        </div>
      </div>

      {/* 自定义地址输入 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          或输入自定义合约地址
        </label>
        <input
          type="text"
          value={customAddress}
          onChange={(e) => handleCustomAddressChange(e.target.value)}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 当前合约地址显示 */}
      {currentContractAddress && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            当前合约地址
          </label>
          <p className="text-sm text-gray-600 break-all font-mono">
            {currentContractAddress}
          </p>
        </div>
      )}

      {/* 刷新按钮 */}
      <div className="mb-6">
        <button
          onClick={handleRefresh}
          disabled={loading || !currentContractAddress}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '加载中...' : '刷新信息'}
        </button>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-800 mb-1">错误</h3>
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}

      {/* 代币信息展示 */}
      {tokenInfo && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">代币信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">基本信息</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">名称:</span>
                  <span className="ml-2 font-medium">{tokenInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">符号:</span>
                  <span className="ml-2 font-medium">{tokenInfo.symbol}</span>
                </div>
                <div>
                  <span className="text-gray-600">精度:</span>
                  <span className="ml-2 font-medium">{tokenInfo.decimals}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-md">
              <h4 className="text-sm font-medium text-green-800 mb-2">供应信息</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">总供应量:</span>
                  <span className="ml-2 font-medium">{tokenInfo.totalSupply}</span>
                </div>
                <div>
                  <span className="text-gray-600">我的余额:</span>
                  <span className="ml-2 font-medium">{tokenInfo.formattedBalance}</span>
                </div>
                <div>
                  <span className="text-gray-600">原始余额:</span>
                  <span className="ml-2 font-medium text-xs break-all">{tokenInfo.balance}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">加载代币信息中...</span>
        </div>
      )}
    </div>
  );
}