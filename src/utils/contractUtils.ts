/**
 * 合约相关工具函数
 */

import { ethers } from 'ethers';

/**
 * 验证以太坊地址格式
 * @param address 地址字符串
 * @returns 是否为有效的以太坊地址
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * 获取地址的校验和格式
 * @param address 地址字符串
 * @returns 校验和格式的地址
 */
export function getChecksumAddress(address: string): string {
  try {
    return ethers.getAddress(address);
  } catch {
    throw new Error('无效的以太坊地址');
  }
}

/**
 * 格式化代币余额
 * @param balance 原始余额（wei）
 * @param decimals 代币精度
 * @returns 格式化后的余额字符串
 */
export function formatTokenBalance(balance: bigint | string, decimals: number): string {
  try {
    const balanceBigInt = typeof balance === 'string' ? BigInt(balance) : balance;
    const divisor = BigInt(10 ** decimals);
    const wholePart = balanceBigInt / divisor;
    const fractionalPart = balanceBigInt % divisor;
    
    // 将小数部分转换为字符串，并补齐前导零
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    
    // 移除尾部的零
    const trimmedFractional = fractionalStr.replace(/0+$/, '');
    
    if (trimmedFractional === '') {
      return wholePart.toString();
    }
    
    return `${wholePart}.${trimmedFractional}`;
  } catch (err) {
    console.error('格式化代币余额失败:', err);
    return '0';
  }
}

/**
 * 解析代币余额
 * @param amount 代币数量
 * @param decimals 代币精度
 * @returns 原始余额（wei）
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  try {
    return ethers.parseUnits(amount, decimals);
  } catch (err) {
    throw new Error(`解析代币数量失败: ${err instanceof Error ? err.message : '未知错误'}`);
  }
}

/**
 * 缩短地址显示
 * @param address 完整地址
 * @param startLength 开头保留长度
 * @param endLength 结尾保留长度
 * @returns 缩短后的地址
 */
export function shortenAddress(
  address: string, 
  startLength: number = 6, 
  endLength: number = 4
): string {
  if (!address) return '';
  
  const start = address.slice(0, startLength);
  const end = address.slice(-endLength);
  return `${start}...${end}`;
}

/**
 * 验证合约地址是否包含ERC20方法
 * @param address 合约地址
 * @param provider 以太坊提供者
 * @returns 是否为ERC20合约
 */
export async function isERC20Contract(
  address: string, 
  provider: ethers.Provider
): Promise<boolean> {
  try {
    const contract = new ethers.Contract(address, [
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function decimals() view returns (uint8)',
      'function totalSupply() view returns (uint256)',
      'function balanceOf(address) view returns (uint256)'
    ], provider);

    // 尝试调用基本方法
    await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);

    return true;
  } catch {
    return false;
  }
}

/**
 * 获取网络名称
 * @param chainId 链ID
 * @returns 网络名称
 */
export function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    56: 'BSC',
    11155111: 'Sepolia',
    80001: 'Mumbai',
    97: 'BSC Testnet'
  };
  
  return networks[chainId] || `Chain ${chainId}`;
}

/**
 * 获取网络图标
 * @param chainId 链ID
 * @returns 网络图标URL
 */
export function getNetworkIcon(chainId: number): string {
  const icons: Record<number, string> = {
    1: '/icons/ethereum.svg',
    137: '/icons/polygon.svg',
    56: '/icons/bsc.svg',
    11155111: '/icons/sepolia.svg',
    80001: '/icons/mumbai.svg',
    97: '/icons/bsc-testnet.svg'
  };
  
  return icons[chainId] || '/icons/default.svg';
} 