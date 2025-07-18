'use client';

import '@/styles/TopNav.css';

export default function TopNav({ onWalletClick }: { onWalletClick: () => void }) {
  return (
    <nav className="top-nav">
      <button className="wallet-nav-btn" onClick={onWalletClick}>
        钱包
      </button>
    </nav>
  );
}
