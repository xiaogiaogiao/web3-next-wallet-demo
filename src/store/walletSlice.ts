import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { EthereumProvider } from '@walletconnect/ethereum-provider'


type WalletProvider = 'metamask' | 'walletconnect' | 'coinbase' | null

// 定义钱包状态接口
interface WalletState {
  providerType: WalletProvider
  currentChainId: number
  accounts: string[]
  isConnected: boolean
  error: string | null
}
// 定义钱包状态初始值
const initialState: WalletState = {
  providerType: null,
  currentChainId: 1, // 默认ETH主网
  accounts: [],
  isConnected: false,
  error: null
}

// 创建Redux切片
export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    // 设置钱包提供者类型
    setProvider: (state, action: PayloadAction<WalletProvider>) => {
      state.providerType = action.payload
    },
    // 设置当前链ID
    setChainId: (state, action: PayloadAction<number>) => {
      state.currentChainId = action.payload
    },
    // 设置账户列表
    setAccounts: (state, action: PayloadAction<string[]>) => {
      state.accounts = action.payload
      state.isConnected = action.payload.length > 0
    },
    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    // 重置钱包状态
    resetWallet: () => initialState
  }
})

// 异步action（处理钱包连接）
export const connectWallet = (providerType: WalletProvider) => {
  return async (dispatch: any) => {
    try {
      dispatch(setError(null))
      
      if (providerType === 'metamask') {
        if (!window.ethereum) throw new Error('MetaMask not installed')
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        
        dispatch(setAccounts(accounts))
        dispatch(setChainId(parseInt(chainId, 16)))
        dispatch(setProvider('metamask'))
        
        // 设置事件监听
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          dispatch(setAccounts(accounts))
        })
        window.ethereum.on('chainChanged', (chainId: string) => {
          dispatch(setChainId(parseInt(chainId, 16)))
        })
      } 
      else if (providerType === 'walletconnect') {
        const provider = await EthereumProvider.init({
          projectId: 'YOUR_PROJECT_ID',
          chains: [1],
          showQrModal: true
        })
        await provider.enable()
        
        dispatch(setAccounts(provider.accounts))
        dispatch(setChainId(provider.chainId))
        dispatch(setProvider('walletconnect'))
        
        provider.on('accountsChanged', (accounts: string[]) => {
          dispatch(setAccounts(accounts))
        })
        provider.on('chainChanged', (chainId: string) => {
          dispatch(setChainId(parseInt(chainId, 16)))
        })
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      dispatch(setError(errMsg))
      dispatch(resetWallet())
    }
  }
}


export const { 
  setProvider, 
  setChainId, 
  setAccounts, 
  setError, 
  resetWallet 
} = walletSlice.actions

export default walletSlice.reducer