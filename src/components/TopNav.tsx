'use client';

import Link from 'next/link';
import '@/styles/TopNav.css';

export default function TopNav({ onWalletClick }: { onWalletClick: () => void }) {
  return (
    <nav className="top-nav">
      <div className="nav-links">
        <Link href="/" className="nav-link">
          首页
        </Link>
        <Link href="/trading" className="nav-link">
          交易
        </Link>
        <Link href="/tokens" className="nav-link">
          代币信息
        </Link>
        <Link href="/test" className="nav-link">
          测试
        </Link>
        <Link href="/debug" className="nav-link">
          调试
        </Link>
      </div>
      <button className="wallet-nav-btn" onClick={onWalletClick}>
        钱包
      </button>
    </nav>
  );
}
