/**
 * 合约相关常量配置
 * 包含ERC20代币的ABI和部署地址
 */

// 移除原有ERC20_ABI内容，改为导入
import ERC20_ABI from '../abis/ERC20.json';

// 常用代币的部署地址（主网）
export const TOKEN_ADDRESSES = {
  // Ethereum主网
  ethereum: {
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    USDC: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  },
  // Polygon网络
  polygon: {
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"
  },
  // BSC网络
  bsc: {
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEF60aF814a3f6F8E2f9"
  }
} as const;

// 测试网代币地址
export const TESTNET_TOKEN_ADDRESSES = {
  // Sepolia测试网
  sepolia: {
    // 这里可以添加Sepolia测试网上的代币地址
    // 通常需要自己部署测试代币或使用现有的测试代币
    TEST_TOKEN: "0x1234567890123456789012345678901234567890"
  },
  // Mumbai测试网
  mumbai: {
    TEST_TOKEN: "0x1234567890123456789012345678901234567890"
  }
} as const;

// 合约事件ABI（用于监听代币转账等事件）
// 已迁移到 abis 目录，如需事件ABI请单独维护在 abis 或 utils 目录

// 合约类型定义
export type TokenAddresses = typeof TOKEN_ADDRESSES;
export type TestnetTokenAddresses = typeof TESTNET_TOKEN_ADDRESSES;
export type NetworkName = keyof TokenAddresses;
export type TokenName = keyof TokenAddresses[NetworkName]; 