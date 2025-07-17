"use client";

//导入钩子
import useWallet from "@/hooks/useWallet";
import "@/styles/globals.css";
import { useState } from "react";

export default function Home(){
    
    //使用自定义Hook来获取钱包连接状态
        const { address, balance, isConnected, connect } = useWallet()
    const [loading, setLoading] = useState(false)

    const handleConnect = async () => {
        setLoading(true)
        try {
        await connect()
        } finally {
        setLoading(false)
        }
    }


    return (
         <div className="wallet-container">
            <h1>Web3 钱包连接 Demo</h1>
            
            {isConnected ? (
                <div className="wallet-info">
                <h2>💰 钱包信息</h2>
                <p><strong>地址:</strong> {address}</p>
                <p><strong>余额:</strong> {balance} ETH</p>
                
                <div className="notice">
                    <small>尝试在MetaMask切换账户，页面将自动更新</small>
                </div>
                </div>
            ) : (
                <button 
                onClick={handleConnect}
                disabled={loading}
                className="connect-button"
                >
                {loading ? '连接中...' : '连接钱包'}
                </button>
            )}
            </div>
        )
   
}



