"use client";

//导入钩子
import { useWallet } from "@/hooks/useWallet";
import { use } from "react";


export default function Home(){
    
    //使用自定义Hook来获取钱包连接状态
    const {address,balance,connect}=useWallet();


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">web3钱包链接</h1>
            <p className="mb-4">连接您的钱包以查看地址和余额</p>
            <button 
                onClick={connect} 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
            连接钱包
            </button>
            {address && (
                <div className="mt-4">
                    <p>Address: {address}</p>
                    <p>Balance: {balance} ETH</p>
                </div>
            )}
        </div>
    )
}



