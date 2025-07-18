import { useState } from 'react';
import { useSwitchChain } from 'wagmi';
import { mainnet, polygon, bsc } from 'wagmi/chains';
import "@/styles/Network.css";

const SUPPORTED_CHAINS = [
  { id: mainnet.id, name: 'Ethereum', chain: mainnet },
  { id: bsc.id, name: 'BNB Chain', chain: bsc },
  { id: polygon.id, name: 'Polygon', chain: polygon }
];

export default function NetworkSwitcher({ currentChainId }: { currentChainId: number }) {
  const [loading, setLoading] = useState(false);
  const { switchChain } = useSwitchChain();

  const handleSwitchChain = async (targetChainId: number) => {
    setLoading(true);
    try {
      await switchChain({ chainId: targetChainId });
    } catch (error: any) {
      alert("切换网络失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="network-switcher">
      <h3>切换网络</h3>
      {SUPPORTED_CHAINS.map((chain) => (
        <button
          key={chain.id}
          onClick={() => handleSwitchChain(chain.id)}
          disabled={chain.id === currentChainId || loading}
          className={chain.id === currentChainId ? 'active' : ''}
        >
          {chain.name}
          {chain.id === currentChainId && '（当前网络）'}
        </button>
      ))}
    </div>
  );
}