"use client";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";

// 声明 window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [web3Provider, setWeb3Provider] = useState<ethers.BrowserProvider | null>(null);

  // 初始化 web3Provider
  useEffect(() => {
    // 确保在客户端环境
    if (typeof window === "undefined") {
      console.log("非浏览器环境，跳过 Ethereum 初始化。");
      return;
    }

    // 确保 window.ethereum 可用
    if (!window.ethereum) {
      console.warn("MetaMask 或兼容钱包未安装/未检测到。");
      return;
    }

    // 如果 web3Provider 已经存在，则不再重复初始化
    if (web3Provider) {
      console.log("web3Provider 已经存在，跳过初始化。");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setWeb3Provider(provider);
      console.log("✅ web3Provider 已成功初始化。", provider);
    } catch (error) {
      console.error("❌ 初始化 web3Provider 失败:", error);
    }
  }, [web3Provider]); // 依赖 web3Provider，防止重复初始化，但只有在首次为 null 时才进入 if 块

  // 统一的账户数据更新逻辑
  const updateAccountData = useCallback(
    async (accountAddress: string) => {
      if (!web3Provider || !accountAddress) {
        setAddress("");
        setBalance("");
        console.log("清空账户数据：无 provider 或无地址。");
        return;
      }
      try {
        setAddress(accountAddress);
        const bal = await web3Provider.getBalance(accountAddress);
        setBalance(ethers.formatEther(bal));
        console.log(`✨ 账户数据更新成功：地址 ${accountAddress}, 余额 ${ethers.formatEther(bal)}`);
      } catch (error) {
        console.error("❌ 获取账户余额失败:", error);
        setAddress("");
        setBalance("");
      }
    },
    [web3Provider]
  );

  // 连接钱包
  const connect = useCallback(async () => {
    if (!web3Provider) {
      console.warn("🚫 Ethereum provider 未准备好，请稍候或检查钱包安装。");
      return;
    }

    try {
      console.log("🔗 正在请求连接账户...");
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        await updateAccountData(accounts[0]);
        console.log("🎉 钱包连接成功并更新数据。");
      } else {
        setAddress("");
        setBalance("");
        console.log("😕 用户拒绝连接或没有可选账户。");
      }
    } catch (error) {
      console.error("❌ 连接钱包失败:", error);
      if ((error as any).code === 4001) {
        console.log("💔 用户拒绝了钱包连接请求。");
      }
      setAddress("");
      setBalance("");
    }
  }, [web3Provider, updateAccountData]);

  // 检查钱包连接状态
  const checkWalletConnection = useCallback(async () => {
    if (!web3Provider) return;
    console.log("🔄 刷新钱包状态...");
    try {
      const accounts = await web3Provider.send("eth_accounts", []);
      if (accounts.length > 0) {
        await updateAccountData(accounts[0]);
      } else {
        setAddress("");
        setBalance("");
        console.log("🔒 未发现已连接的账户。");
      }
    } catch (error) {
      console.error("❌ 检查连接状态失败:", error);
      setAddress("");
      setBalance("");
    }
  }, [web3Provider, updateAccountData]);

  // 账户变化处理器
  const handleAccountsChanged = useCallback(
    async (accounts: string[]) => {
      // 🚀🚀🚀 这个打印是关键！如果它不出现，说明事件未触发。 🚀🚀🚀
      console.log("✅✅✅ MetaMask 账户变更事件已触发! ✅✅✅", accounts); 

      if (!web3Provider) {
        console.warn("🚫 accountsChanged 事件触发，但 web3Provider 不可用。");
        return;
      }

      if (accounts.length === 0) {
        setAddress("");
        setBalance("");
        console.log("🔗 所有账户已断开。");
      } else {
        console.log("➡️ 新选择的账户:", accounts[0]);
        await updateAccountData(accounts[0]);
      }
    },
    [web3Provider, updateAccountData] // 确保依赖完整
  );

  // Effect: 设置事件监听器
  useEffect(() => {
    // 再次确认 window.ethereum 和 web3Provider 都可用
    if (typeof window === "undefined" || !window.ethereum || !web3Provider) {
      console.log("等待环境和 web3Provider 准备就绪，暂不设置监听器。");
      return;
    }

    console.log("🎉 准备设置 MetaMask 事件监听器...");

    // 首次加载时，检查一下当前连接的账户
    checkWalletConnection();

    // 绑定事件监听器
    // 使用一个局部函数变量来确保 on 和 removeListener 引用的是同一个函数
    const accountsChangedHandler = (accounts: string[]) => {
      handleAccountsChanged(accounts);
    };

    window.ethereum.on("accountsChanged", accountsChangedHandler);
    console.log("🟢 'accountsChanged' 事件监听器已绑定。");

    // 清理函数：在组件卸载或依赖项变化时移除监听器
    return () => {
      console.log("🔴 移除 'accountsChanged' 事件监听器。");
      window.ethereum?.removeListener("accountsChanged", accountsChangedHandler);
    };
  }, [web3Provider, handleAccountsChanged, checkWalletConnection]); // 确保依赖项完整

  return { address, balance, connect, web3Provider, checkWalletConnection };
};