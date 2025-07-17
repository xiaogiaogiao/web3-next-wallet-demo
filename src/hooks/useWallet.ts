"use client";
import {useEffect,useState} from "react";
import {ethers} from "ethers";

export const useWallet =() =>{
    //这是一个自定义Hook，用于管理钱包连接状态
    const  [address,setAddress] =useState<string>("");
    //钱包地址
    const  [balance,setBalance] =useState<string>("");


 
    const connect= async () =>{
         //链接钱包
         if(!window.ethereum){
             alert("请安装 MetaMask钱包");
             return;
         }
         //请求用户链接钱包
         const provider =new ethers.providers.web3Provider(window.ethereum);
         //获取用户账户
         const accounts =await provider.send("eth_requestAccounts",[]);
         //signer是一个用于签名交易的对象
         //它可以用来发送交易、签名消息等
         const signer =await provider.getSigner();
         //获取用户余额 bal
         const bal=await provider.getBalance(accounts[0]);
         //将余额转换成以太坊单位
         setAddress(accounts[0]);
         //设置钱包地址
         setBalance(ethers.formatEther(bal));

    };
    //useEffect是一个React Hook,用于处理副作用
    //在组件渲染后执行一次，并返回一个清理函数
    //为什么使用useEffect？
    //因为我们需要在组件挂载时执行一些副作用操作，比如获取钱包地址
    //什么是副作用？
    //副作用是指在组件渲染过程中需要执行的操作，比如获取数据
    

    //如果钱包地址发生变化，我们可以更新余额
    //为什么useEffect需要传入一个空数组作为第二个参数？
    //因为我们只希望在组件挂载时执行一次，而不是每次渲染时都执行
    //空数组表示没有依赖项，useEffect只会在组件挂载时执行一次
    //如果我们传入了一个包含依赖项的数组，useEffect会在组件更新时执行
    //如果依赖项发生变化，useEffect会重新执行
    //如果依赖项没有变化，useEffect不会重新执行
    //在这里我们可以使用useEffect来监听钱包地址的变化
    useEffect(()=>{
        //在组件挂载时连接钱包
        window.ethereum?.on("acccountChanged",connect);
      
        return ()=>{
            //在组件卸载时移除监听
            window.ethereum?.removeListener("accountChanged",connect);
      
        };
     
    },[])
    //返回钱包地址、余额和连接钱包的函数
    return {address,balance,connect};
}