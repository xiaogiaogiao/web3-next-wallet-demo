/**
 * 合约交互Hook
 * 提供ERC20代币的read-only调用功能
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount, usePublicClient } from 'wagmi';
import ERC20_ABI from '../abis/ERC20.json';
import { TOKEN_ADDRESSES, TESTNET_TOKEN_ADDRESSES } from '../constants/contracts';
import { formatTokenBalance, isValidAddress, getChecksumAddress } from '../utils/contractUtils';

// 代币信息接口
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
  formattedBalance: string;
}

// 合约调用错误
export interface ContractError {
  message: string;
  code?: string;
}

/**
 * 使用合约的Hook
 * @param contractAddress 合约地址
 * @returns 合约交互方法和状态
 */
export function useContract(contractAddress?: string) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ContractError | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  /**
   * 获取代币基本信息
   * @param address 合约地址
   * @returns 代币信息
   */
  const getTokenInfo = useCallback(async (address: string): Promise<TokenInfo> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    // 验证地址格式
    if (!isValidAddress(address)) {
      throw new Error('无效的合约地址');
    }

    try {
      // 获取校验和地址
      const checksumAddress = getChecksumAddress(address);
      
      // 创建合约实例
      const contract = {
        address: checksumAddress as `0x${string}`,
        abi: ERC20_ABI,
      };

      // 并行调用所有read-only方法
      const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
        publicClient.readContract({
          ...contract,
          functionName: 'name',
        }),
        publicClient.readContract({
          ...contract,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          ...contract,
          functionName: 'decimals',
        }),
        publicClient.readContract({
          ...contract,
          functionName: 'totalSupply',
        }),
        address ? publicClient.readContract({
          ...contract,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        }) : BigInt(0),
      ]);

      const formattedBalance = formatTokenBalance(balance, decimals);
      const formattedTotalSupply = formatTokenBalance(totalSupply, decimals);

      return {
        name,
        symbol,
        decimals,
        totalSupply: formattedTotalSupply,
        balance: balance.toString(),
        formattedBalance,
      };
    } catch (err) {
      console.error('获取代币信息失败:', err);
      throw new Error(`获取代币信息失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  }, [publicClient]);

  /**
   * 获取指定地址的代币余额
   * @param tokenAddress 代币合约地址
   * @param userAddress 用户地址
   * @returns 代币余额
   */
  const getTokenBalance = useCallback(async (
    tokenAddress: string, 
    userAddress: string
  ): Promise<string> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    if (!isValidAddress(tokenAddress) || !isValidAddress(userAddress)) {
      throw new Error('无效的地址格式');
    }

    try {
      const checksumTokenAddress = getChecksumAddress(tokenAddress);
      const checksumUserAddress = getChecksumAddress(userAddress);
      
      const balance = await publicClient.readContract({
        address: checksumTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [checksumUserAddress as `0x${string}`],
      });

      return balance.toString();
    } catch (err) {
      console.error('获取代币余额失败:', err);
      throw new Error(`获取代币余额失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  }, [publicClient]);

  /**
   * 获取授权额度
   * @param tokenAddress 代币合约地址
   * @param ownerAddress 所有者地址
   * @param spenderAddress 被授权者地址
   * @returns 授权额度
   */
  const getAllowance = useCallback(async (
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<string> => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    if (!isValidAddress(tokenAddress) || !isValidAddress(ownerAddress) || !isValidAddress(spenderAddress)) {
      throw new Error('无效的地址格式');
    }

    try {
      const checksumTokenAddress = getChecksumAddress(tokenAddress);
      const checksumOwnerAddress = getChecksumAddress(ownerAddress);
      const checksumSpenderAddress = getChecksumAddress(spenderAddress);
      
      const allowance = await publicClient.readContract({
        address: checksumTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [checksumOwnerAddress as `0x${string}`, checksumSpenderAddress as `0x${string}`],
      });

      return allowance.toString();
    } catch (err) {
      console.error('获取授权额度失败:', err);
      throw new Error(`获取授权额度失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  }, [publicClient]);

  /**
   * 加载代币信息
   */
  const loadTokenInfo = useCallback(async () => {
    if (!contractAddress || !address) {
      setTokenInfo(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const info = await getTokenInfo(contractAddress);
      setTokenInfo(info);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : '加载代币信息失败',
      });
    } finally {
      setLoading(false);
    }
  }, [contractAddress, address, getTokenInfo]);

  // 当合约地址或用户地址变化时，自动加载代币信息
  useEffect(() => {
    loadTokenInfo();
  }, [loadTokenInfo]);

  return {
    // 状态
    loading,
    error,
    tokenInfo,
    
    // 方法
    getTokenInfo,
    getTokenBalance,
    getAllowance,
    loadTokenInfo,
  };
}

/**
 * 获取指定网络的代币地址
 * @param network 网络名称
 * @param tokenName 代币名称
 * @returns 代币地址
 */
export function getTokenAddress(network: string, tokenName: string): string | undefined {
  const addresses = TOKEN_ADDRESSES[network as keyof typeof TOKEN_ADDRESSES];
  return addresses?.[tokenName as keyof typeof addresses];
}

/**
 * 获取测试网代币地址
 * @param network 测试网名称
 * @param tokenName 代币名称
 * @returns 代币地址
 */
export function getTestnetTokenAddress(network: string, tokenName: string): string | undefined {
  const addresses = TESTNET_TOKEN_ADDRESSES[network as keyof typeof TESTNET_TOKEN_ADDRESSES];
  return addresses?.[tokenName as keyof typeof addresses];
} 