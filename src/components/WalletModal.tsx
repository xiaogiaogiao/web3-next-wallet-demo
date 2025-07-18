'use client';

import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi';
import { useState } from 'react';
import WalletSignIn from '@/components/WalletSignIn';

function SendEthForm() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 这里用 window.ethereum + ethers.js 发送交易
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTxHash('');
    if (!isConnected) {
      setError('请先连接钱包');
      return;
    }
    if (!to || !amount) {
      setError('请输入接收地址和金额');
      return;
    }
    setLoading(true);
    try {
      // 用 ethers.js 发送交易
      // @ts-ignore
      const provider = new (await import('ethers')).ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: (await import('ethers')).ethers.parseEther(amount)
      });
      setTxHash(tx.hash);
    } catch (err: any) {
      setError(err.message || '转账失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="mt-6 space-y-3">
      <h3 className="text-base font-semibold text-gray-800 mb-2">ETH 转账</h3>
      <input
        type="text"
        placeholder="接收地址"
        value={to}
        onChange={e => setTo(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        type="number"
        placeholder="金额 (ETH)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        min="0"
        step="any"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition disabled:opacity-60"
      >
        {loading ? '转账中...' : '发送'}
      </button>
      {txHash && (
        <div className="mt-2 text-green-600 text-sm break-all">
          交易已发出，哈希：
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHash}
          </a>
        </div>
      )}
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
    </form>
  );
}

export default function WalletModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const chainId = useChainId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
          aria-label="关闭"
        >
          ×
        </button>
        <h1 className="text-xl font-bold text-center mb-6">Web3 多钱包连接</h1>
        {isConnected ? (
          <div className="wallet-info space-y-3">
            <h2 className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <span>🌐</span> 已连接钱包
            </h2>
            <div className="break-all text-gray-700">
              <span className="font-medium">地址:</span> {address}
            </div>
            <div className="text-gray-700">
              <span className="font-medium">余额:</span> {balance ? `${balance.formatted} ${balance.symbol}` : '加载中...'}
            </div>
            <div className="text-gray-700">
              <span className="font-medium">ChainID:</span> {chainId}
            </div>
            <div className="my-4 border-t border-dashed border-gray-200"></div>
            <WalletSignIn />
            <div className="my-4 border-t border-dashed border-gray-200"></div>
            <SendEthForm />
            <button
              className="w-full mt-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
              onClick={() => { disconnect(); onClose(); }}
            >
              断开连接
            </button>
          </div>
        ) : (
          <div className="connect-section flex flex-col items-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">请选择钱包连接</h2>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                onClick={() => connect({ connector })}
                disabled={isPending}
              >
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}