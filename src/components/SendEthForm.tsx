'use client';

import { useState } from 'react';
import useWallet from '@/hooks/useWallet';

export default function SendEthForm() {
  const { isConnected, sendTransaction } = useWallet();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const hash = await sendTransaction(to, amount);
      setTxHash(hash);
    } catch (err: any) {
      setError(err.message || '转账失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSend} style={{ marginTop: 24, maxWidth: 400 }}>
      <h3>ETH 转账</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="接收地址"
          value={to}
          onChange={e => setTo(e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <input
          type="number"
          placeholder="金额 (ETH)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          min="0"
          step="any"
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: 10,
          borderRadius: 4,
          background: '#007bff',
          color: '#fff',
          border: 'none',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '转账中...' : '发送'}
      </button>
      {txHash && (
        <div style={{ marginTop: 12, color: 'green', wordBreak: 'break-all' }}>
          交易已发出，哈希：<br />
          <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a>
        </div>
      )}
      {error && (
        <div style={{ marginTop: 12, color: 'red' }}>{error}</div>
      )}
    </form>
  );
}