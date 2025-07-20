'use client';

import React, { useState, useMemo } from 'react';

export interface OrderBookEntry {
  price: number | string;
  quantity: number | string;
  total?: number | string;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
}

interface OrderBookProps {
  data: OrderBookData;
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  maxDepth?: number;
  onPriceClick?: (price: string, side: 'buy' | 'sell') => void;
}

const OrderBook: React.FC<OrderBookProps> = ({
  data,
  symbol,
  baseCurrency,
  quoteCurrency,
  maxDepth = 20,
  onPriceClick
}) => {
  const [depth, setDepth] = useState(20);
  const [showDepth, setShowDepth] = useState(true);

  // 处理订单簿数据
  const processedData = useMemo(() => {
    const bids = data.bids
      .slice(0, depth)
      .sort((a, b) => Number(b.price) - Number(a.price));
    
    const asks = data.asks
      .slice(0, depth)
      .sort((a, b) => Number(a.price) - Number(b.price));

    // 计算累计数量
    let bidCumulative = 0;
    const bidsWithCumulative = bids.map(bid => {
      bidCumulative += Number(bid.quantity);
      return {
        ...bid,
        cumulative: bidCumulative
      };
    });

    let askCumulative = 0;
    const asksWithCumulative = asks.map(ask => {
      askCumulative += Number(ask.quantity);
      return {
        ...ask,
        cumulative: askCumulative
      };
    });

    // 计算最大累计数量用于深度图
    const maxBidCumulative = Math.max(...bidsWithCumulative.map(b => b.cumulative));
    const maxAskCumulative = Math.max(...asksWithCumulative.map(a => a.cumulative));
    const maxCumulative = Math.max(maxBidCumulative, maxAskCumulative);

    return {
      bids: bidsWithCumulative.map(bid => ({
        ...bid,
        depthPercentage: (bid.cumulative / maxCumulative) * 100
      })),
      asks: asksWithCumulative.map(ask => ({
        ...ask,
        depthPercentage: (ask.cumulative / maxCumulative) * 100
      }))
    };
  }, [data, depth]);

  // 计算买卖价差
  const spread = useMemo(() => {
    if (processedData.bids.length === 0 || processedData.asks.length === 0) {
      return { value: 0, percentage: 0 };
    }

    const bestBid = Number(processedData.bids[0].price);
    const bestAsk = Number(processedData.asks[0].price);
    const spreadValue = bestAsk - bestBid;
    const spreadPercentage = (spreadValue / bestBid) * 100;

    return {
      value: spreadValue,
      percentage: spreadPercentage
    };
  }, [processedData]);

  const handlePriceClick = (price: string, side: 'buy' | 'sell') => {
    if (onPriceClick) {
      onPriceClick(price, side);
    }
  };

  const formatPrice = (price: number | string) => {
    return Number(price).toFixed(2);
  };

  const formatQuantity = (quantity: number | string) => {
    return Number(quantity).toFixed(6);
  };

  const renderOrderBookRow = (
    entry: any,
    side: 'buy' | 'sell',
    index: number
  ) => {
    const isEven = index % 2 === 0;
    const depthOpacity = Math.min(entry.depthPercentage * 0.08, 0.3);

    return (
      <div
        key={`${side}-${index}`}
        className={`order-book-row ${side} ${isEven ? 'even' : 'odd'}`}
        style={{
          position: 'relative'
        }}
        onClick={() => handlePriceClick(entry.price, side)}
      >
        <div className="order-book-cell price">
          <span className={`price-text ${side === 'buy' ? 'bid' : 'ask'}`}>
            {formatPrice(entry.price)}
          </span>
        </div>
        <div className="order-book-cell quantity">
          <span className="quantity-text">
            {formatQuantity(entry.quantity)}
          </span>
        </div>
        <div className="order-book-cell cumulative">
          <span className="cumulative-text">
            {formatQuantity(entry.cumulative)}
          </span>
        </div>
        {showDepth && (
          <div 
            className="depth-bar"
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: `${entry.depthPercentage}%`,
              background: side === 'buy' 
                ? `rgba(0, 212, 170, ${depthOpacity})` 
                : `rgba(255, 71, 87, ${depthOpacity})`,
              zIndex: -1
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="order-book-container">
      <div className="order-book-header">
        <div className="symbol-info">
          <h3>{symbol}</h3>
          <div className="spread-info">
            <span className="spread-label">价差</span>
            <span className="spread-value">
              {formatPrice(spread.value)} ({spread.percentage.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="controls">
          <div className="depth-selector">
            <button
              className={`depth-btn ${depth === 10 ? 'active' : ''}`}
              onClick={() => setDepth(10)}
            >
              10档
            </button>
            <button
              className={`depth-btn ${depth === 20 ? 'active' : ''}`}
              onClick={() => setDepth(20)}
            >
              20档
            </button>
          </div>
          <button
            className={`depth-toggle ${showDepth ? 'active' : ''}`}
            onClick={() => setShowDepth(!showDepth)}
          >
            {showDepth ? '隐藏深度' : '显示深度'}
          </button>
        </div>
      </div>

      <div className="order-book-content">
        <div className="order-book-side asks">
          <div className="order-book-header-row">
            <div className="order-book-cell">价格({quoteCurrency})</div>
            <div className="order-book-cell">数量({baseCurrency})</div>
            <div className="order-book-cell">累计({baseCurrency})</div>
          </div>
          <div className="order-book-rows">
            {processedData.asks.map((ask, index) => 
              renderOrderBookRow(ask, 'sell', index)
            )}
          </div>
        </div>

        <div className="order-book-spread">
          <div className="spread-line">
            <span className="spread-text">
              {processedData.bids.length > 0 ? formatPrice(processedData.bids[0].price) : '--'}
            </span>
          </div>
        </div>

        <div className="order-book-side bids">
          <div className="order-book-rows">
            {processedData.bids.map((bid, index) => 
              renderOrderBookRow(bid, 'buy', index)
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .order-book-container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          border-radius: 16px;
          padding: 20px;
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 212, 170, 0.1);
          position: relative;
          overflow: hidden;
        }

        .order-book-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.5), transparent);
        }

        .order-book-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .symbol-info h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #00d4aa, #00b894);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .spread-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spread-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .spread-value {
          font-size: 12px;
          font-weight: 600;
          color: #00d4aa;
          padding: 2px 6px;
          background: rgba(0, 212, 170, 0.1);
          border-radius: 4px;
          border: 1px solid rgba(0, 212, 170, 0.2);
        }

        .controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .depth-selector {
          display: flex;
          gap: 2px;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .depth-btn {
          padding: 4px 8px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .depth-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .depth-btn.active {
          background: linear-gradient(135deg, #00d4aa, #00b894);
          color: #000000;
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0, 212, 170, 0.3);
        }

        .depth-toggle {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .depth-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .depth-toggle.active {
          background: linear-gradient(135deg, #00d4aa, #00b894);
          color: #000000;
          font-weight: 600;
          border-color: transparent;
          box-shadow: 0 2px 6px rgba(0, 212, 170, 0.3);
        }

        .order-book-content {
          display: flex;
          flex-direction: column;
        }

        .order-book-side {
          flex: 1;
        }

        .order-book-header-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .order-book-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          padding: 6px 0;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          border-radius: 4px;
          margin: 1px 0;
        }

        .order-book-row:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          transform: translateX(2px);
        }

        .order-book-row.even {
          background: rgba(255, 255, 255, 0.02);
        }

        .order-book-cell {
          padding: 4px 8px;
          text-align: right;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .order-book-cell.price {
          text-align: left;
          justify-content: flex-start;
        }

        .price-text {
          font-weight: 600;
          font-size: 13px;
          transition: color 0.2s ease;
        }

        .price-text.bid {
          color: #00d4aa;
        }

        .price-text.ask {
          color: #ff4757;
        }

        .quantity-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
        }

        .cumulative-text {
          color: rgba(255, 255, 255, 0.6);
          font-size: 11px;
        }

        .order-book-spread {
          padding: 12px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          position: relative;
        }

        .spread-line {
          position: relative;
        }

        .spread-line::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.3), transparent);
          z-index: 0;
        }

        .spread-text {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 4px 12px;
          color: #00d4aa;
          font-size: 14px;
          font-weight: 700;
          position: relative;
          z-index: 1;
          border-radius: 6px;
          border: 1px solid rgba(0, 212, 170, 0.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .depth-bar {
          transition: width 0.3s ease;
          border-radius: 0 4px 4px 0;
        }
      `}</style>
    </div>
  );
};

export default OrderBook; 