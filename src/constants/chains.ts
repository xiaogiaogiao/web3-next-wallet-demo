export const CHAIN_PARAMS: Record<number, any> = {
    1: {
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://rpc.ankr.com/eth'],
      blockExplorerUrls: ['https://etherscan.io'],
    },
    56: {
      chainId: '0x38',
      chainName: 'Binance Smart Chain Mainnet', // 官方推荐名称
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
      blockExplorerUrls: ['https://bscscan.com'],
    },
    137: {
      chainId: '0x89',
      chainName: 'Polygon Mainnet', // 官方推荐名称
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com'],
    }
  };