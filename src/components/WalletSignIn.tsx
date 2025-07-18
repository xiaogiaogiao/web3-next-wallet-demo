"use client";

import { useState } from 'react';
import useWallet from '@/hooks/useWallet';

export default function WalletSignIn() {
  const { isConnected, signIn, address, loaggedIn } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError('');
    setSuccess(false);
    setSignature(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await signIn();
      if (res && res.success) {
        setSuccess(true);
        setSignature(res.signature);
        setMessage(res.message);
      } else {
        setError(res?.error || '登录失败');
      }
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return <div className="text-gray-500">请先连接钱包</div>;
  }

  return (
    <div className="mt-6 space-y-3">
      <button
        className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
        onClick={handleSignIn}
        disabled={loading || loaggedIn}
      >
        {loading ? '签名中...' : loaggedIn ? '已登录' : '钱包无密码登录'}
      </button>
      {success && (
        <div className="text-green-600 text-sm break-all">
          登录成功！<br />
          地址：{address}<br />
          签名：{signature}<br />
          消息：{message}
        </div>
      )}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
} 