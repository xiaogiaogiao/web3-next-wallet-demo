'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface DepthData {
  bids: Array<{
    price: number | string;
    quantity: number | string;
  }>;
  asks: Array<{
    price: number | string;
    quantity: number | string;
  }>;
}

interface DepthChartProps {
  data: DepthData;
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  height?: number;
  width?: number;
}

const DepthChart: React.FC<DepthChartProps> = ({
  data,
  symbol,
  baseCurrency,
  quoteCurrency,
  height = 300,
  width = 600
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  // 处理深度数据
  const processDepthData = (rawData: DepthData) => {
    if (!rawData.bids.length || !rawData.asks.length) {
      return { bids: [], asks: [] };
    }

    // 排序数据
    const sortedBids = [...rawData.bids]
      .sort((a, b) => Number(b.price) - Number(a.price))
      .map(entry => ({
        price: Number(entry.price),
        quantity: Number(entry.quantity)
      }));

    const sortedAsks = [...rawData.asks]
      .sort((a, b) => Number(a.price) - Number(b.price))
      .map(entry => ({
        price: Number(entry.price),
        quantity: Number(entry.quantity)
      }));

    // 计算累计数量
    let bidCumulative = 0;
    const bidsWithCumulative = sortedBids.map(bid => {
      bidCumulative += bid.quantity;
      return {
        price: bid.price,
        cumulative: bidCumulative
      };
    });

    let askCumulative = 0;
    const asksWithCumulative = sortedAsks.map(ask => {
      askCumulative += ask.quantity;
      return {
        price: ask.price,
        cumulative: askCumulative
      };
    });

    // 转换为 ECharts 格式
    const convertToEChartsData = (data: any[]) => {
      return data.map(item => [item.price, item.cumulative]);
    };

    return {
      bids: convertToEChartsData(bidsWithCumulative),
      asks: convertToEChartsData(asksWithCumulative)
    };
  };

  // 初始化图表
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 创建图表
    const chart = echarts.init(chartContainerRef.current);
    chartRef.current = chart;

    // 响应式调整
    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  // 更新图表数据
  useEffect(() => {
    if (!chartRef.current || !data.bids.length || !data.asks.length) return;

    const processedData = processDepthData(data);
    
    const option = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 300,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: '#00d4aa',
            width: 1,
            type: 'dashed'
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderColor: '#00d4aa',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: '#ffffff',
          fontSize: 12
        },
        padding: [12, 16],
        formatter: function (params: any) {
          const bidData = params[0]?.data;
          const askData = params[1]?.data;
          const price = bidData ? bidData[0] : askData[0];
          const bidCumulative = bidData ? bidData[1] : 0;
          const askCumulative = askData ? askData[1] : 0;
          
          return `
            <div style="font-family: 'Monaco', 'Menlo', monospace;">
              <div style="margin-bottom: 8px; font-weight: 600; color: #00d4aa;">
                价格: ${price.toFixed(2)} ${quoteCurrency}
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                <div>买单累计: <span style="color: #00d4aa; font-weight: 600;">${bidCumulative.toFixed(2)}</span></div>
                <div>卖单累计: <span style="color: #ff4757; font-weight: 600;">${askCumulative.toFixed(2)}</span></div>
              </div>
            </div>
          `;
        }
      },
      grid: {
        left: '8%',
        right: '8%',
        top: '15%',
        bottom: '15%',
        backgroundColor: 'rgba(0, 212, 170, 0.02)',
        borderColor: 'rgba(0, 212, 170, 0.1)',
        borderWidth: 1
      },
      xAxis: {
        type: 'value',
        name: `价格 (${quoteCurrency})`,
        nameTextStyle: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 12,
          fontWeight: 500
        },
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 10
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.05)',
            type: 'dashed'
          }
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: `累计数量 (${baseCurrency})`,
        nameTextStyle: {
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 12,
          fontWeight: 500
        },
        nameLocation: 'middle',
        nameGap: 40,
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 10
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.05)',
            type: 'dashed'
          }
        },
        axisTick: {
          show: false
        }
      },
      series: [
        {
          name: '买单深度',
          type: 'line',
          data: processedData.bids,
          smooth: true,
          lineStyle: {
            color: '#00d4aa',
            width: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 212, 170, 0.3)'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 212, 170, 0.4)' },
                { offset: 1, color: 'rgba(0, 212, 170, 0.0)' }
              ]
            }
          },
          symbol: 'none',
          emphasis: {
            lineStyle: {
              width: 4,
              shadowBlur: 15,
              shadowColor: 'rgba(0, 212, 170, 0.5)'
            }
          }
        },
        {
          name: '卖单深度',
          type: 'line',
          data: processedData.asks,
          smooth: true,
          lineStyle: {
            color: '#ff4757',
            width: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(255, 71, 87, 0.3)'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 71, 87, 0.4)' },
                { offset: 1, color: 'rgba(255, 71, 87, 0.0)' }
              ]
            }
          },
          symbol: 'none',
          emphasis: {
            lineStyle: {
              width: 4,
              shadowBlur: 15,
              shadowColor: 'rgba(255, 71, 87, 0.5)'
            }
          }
        }
      ]
    };

    chartRef.current.setOption(option);
  }, [data, baseCurrency, quoteCurrency]);

  // 格式化价格
  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  // 格式化数量
  const formatQuantity = (quantity: number) => {
    return quantity.toFixed(2);
  };

  // 计算买卖价差
  const calculateSpread = () => {
    if (!data.bids.length || !data.asks.length) {
      return { value: 0, percentage: 0 };
    }

    const bestBid = Number(data.bids[0].price);
    const bestAsk = Number(data.asks[0].price);
    const spreadValue = bestAsk - bestBid;
    const spreadPercentage = (spreadValue / bestBid) * 100;

    return {
      value: spreadValue,
      percentage: spreadPercentage
    };
  };

  const spread = calculateSpread();

  return (
    <div className="depth-chart-container">
      <div className="depth-chart-header">
        <div className="symbol-info">
          <h3>{symbol} 深度图</h3>
          <div className="spread-info">
            <span className="spread-label">价差</span>
            <span className="spread-value">
              {formatPrice(spread.value)} ({spread.percentage.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="depth-stats">
          <div className="stat-item">
            <span className="stat-label">买单</span>
            <span className="stat-value bid">{data.bids.length} 档</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">卖单</span>
            <span className="stat-value ask">{data.asks.length} 档</span>
          </div>
        </div>
      </div>

      <div className="depth-chart-content">
        <div ref={chartContainerRef} className="echarts-chart" style={{ width: width, height: height }} />
      </div>

      <div className="depth-chart-legend">
        <div className="legend-item">
          <div className="legend-color bid"></div>
          <span>买单深度</span>
        </div>
        <div className="legend-item">
          <div className="legend-color ask"></div>
          <span>卖单深度</span>
        </div>
      </div>

      <style jsx>{`
        .depth-chart-container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          border-radius: 16px;
          padding: 20px;
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 212, 170, 0.1);
          position: relative;
          overflow: hidden;
        }

        .depth-chart-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.5), transparent);
        }

        .depth-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .symbol-info h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
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
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .spread-value {
          font-size: 14px;
          font-weight: 600;
          color: #00d4aa;
          padding: 4px 8px;
          background: rgba(0, 212, 170, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(0, 212, 170, 0.2);
        }

        .depth-stats {
          display: flex;
          gap: 16px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 600;
        }

        .stat-value.bid {
          color: #00d4aa;
        }

        .stat-value.ask {
          color: #ff4757;
        }

        .depth-chart-content {
          margin-bottom: 20px;
          position: relative;
        }

        .echarts-chart {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .depth-chart-legend {
          display: flex;
          justify-content: center;
          gap: 32px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .legend-color {
          width: 16px;
          height: 4px;
          border-radius: 2px;
          position: relative;
        }

        .legend-color.bid {
          background: linear-gradient(90deg, #00d4aa, rgba(0, 212, 170, 0.3));
          box-shadow: 0 0 8px rgba(0, 212, 170, 0.3);
        }

        .legend-color.ask {
          background: linear-gradient(90deg, #ff4757, rgba(255, 71, 87, 0.3));
          box-shadow: 0 0 8px rgba(255, 71, 87, 0.3);
        }
      `}</style>
    </div>
  );
};

export default DepthChart; 