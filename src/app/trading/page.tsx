'use client';

import React, { useState, useEffect } from 'react';
import OrderBook, { OrderBookData } from '@/components/OrderBook';
import CandlestickChart, { CandlestickDataPoint } from '@/components/CandlestickChart';
import DepthChart, { DepthData } from '@/components/DepthChart';

export default function TradingPage() {
  const [orderBookData, setOrderBookData] = useState<OrderBookData>({
    bids: [],
    asks: [],
    lastUpdateId: 0
  });
  const [candlestickData, setCandlestickData] = useState<CandlestickDataPoint[]>([]);
  const [depthData, setDepthData] = useState<DepthData>({ bids: [], asks: [] });

  // 生成模拟数据
  useEffect(() => {
    const generateMockData = () => {
      const bids = [];
      const asks = [];
      const basePrice = 50000;

      // 生成买单
      for (let i = 0; i < 20; i++) {
        const price = basePrice * (1 - (i + 1) * 0.001 - Math.random() * 0.002);
        const quantity = Math.random() * 5 + 0.001;
        bids.push({
          price: price.toFixed(2),
          quantity: quantity.toFixed(6)
        });
      }

      // 生成卖单
      for (let i = 0; i < 20; i++) {
        const price = basePrice * (1 + (i + 1) * 0.001 + Math.random() * 0.002);
        const quantity = Math.random() * 5 + 0.001;
        asks.push({
          price: price.toFixed(2),
          quantity: quantity.toFixed(6)
        });
      }

      setOrderBookData({
        bids,
        asks,
        lastUpdateId: Date.now()
      });

      // 生成深度图数据
      setDepthData({ bids, asks });

      // 生成K线数据
      const candles = [];
      let currentPrice = basePrice;
      const now = Date.now();

      for (let i = 0; i < 100; i++) {
        const open = currentPrice;
        const high = open * (1 + Math.random() * 0.02);
        const low = open * (1 - Math.random() * 0.02);
        const close = open * (1 + (Math.random() - 0.5) * 0.01);
        const volume = Math.random() * 100 + 10;
        const timestamp = now - (100 - i) * 60000; // 每分钟一条

        candles.push({
          time: timestamp,
          open,
          high,
          low,
          close,
          volume
        });

        currentPrice = close;
      }

      setCandlestickData(candles);
    };

    generateMockData();
    
    // 每秒更新数据
    const interval = setInterval(generateMockData, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handlePriceClick = (price: string, side: 'buy' | 'sell') => {
    console.log(`点击价格: ${price}, 方向: ${side}`);
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#0f0f0f', 
      color: 'white', 
      minHeight: '100vh' 
    }}>
      <h1>实时交易页面</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 350px', 
        gap: '20px', 
        marginTop: '20px' 
      }}>
        <div>
          <CandlestickChart
            data={candlestickData}
            symbol="BTC/USDT"
            timeframes={['1m', '5m', '15m', '1h', '4h', '1d']}
            defaultTimeframe="1h"
            height={400}
          />
          
          <div style={{ marginTop: '20px' }}>
            <DepthChart
              data={depthData}
              symbol="BTC/USDT"
              baseCurrency="BTC"
              quoteCurrency="USDT"
              height={200}
            />
          </div>
        </div>
        
        <div>
          <OrderBook
            data={orderBookData}
            symbol="BTC/USDT"
            baseCurrency="BTC"
            quoteCurrency="USDT"
            onPriceClick={handlePriceClick}
          />
        </div>
      </div>
      
      <div style={{ 
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        <div style={{ 
          background: '#2a2a2a', 
          padding: '20px', 
          borderRadius: '8px' 
        }}>
          <h3>交易面板</h3>
          <p>限价单/市价单交易</p>
        </div>
        
        <div style={{ 
          background: '#2a2a2a', 
          padding: '20px', 
          borderRadius: '8px' 
        }}>
          <h3>成交记录</h3>
          <p>最新成交信息</p>
        </div>
      </div>
    </div>
  );
} 