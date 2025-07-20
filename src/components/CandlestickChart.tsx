'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

export interface CandlestickDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  data: CandlestickDataPoint[];
  symbol: string;
  timeframes: string[];
  defaultTimeframe: string;
  height?: number;
  width?: number;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  symbol,
  timeframes,
  defaultTimeframe,
  height = 400,
  width = 800
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(defaultTimeframe);

  // 转换数据格式为 ECharts 格式
  const convertToEChartsData = (rawData: CandlestickDataPoint[]) => {
    return rawData.map(item => [
      item.time,
      item.open,
      item.close,
      item.low,
      item.high,
      item.volume
    ]);
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
    if (!chartRef.current || !data.length) return;

    const chartData = convertToEChartsData(data);
    
    const option = {
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 300,
      legend: {
        data: ['K线', '成交量'],
        textStyle: {
          color: '#e0e0e0',
          fontSize: 12,
          fontWeight: 500
        },
        top: 10,
        right: 20
      },
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
          const data = params[0].data;
          const volume = params[1]?.data || 0;
          const change = data[2] - data[1];
          const changePercent = ((change / data[1]) * 100).toFixed(2);
          const isPositive = change >= 0;
          
          return `
            <div style="font-family: 'Monaco', 'Menlo', monospace;">
              <div style="margin-bottom: 8px; font-weight: 600; color: #00d4aa;">
                ${new Date(data[0]).toLocaleString()}
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                <div>开盘: <span style="color: #e0e0e0;">${data[1].toFixed(2)}</span></div>
                <div>收盘: <span style="color: ${isPositive ? '#00d4aa' : '#ff4757'}; font-weight: 600;">${data[2].toFixed(2)}</span></div>
                <div>最低: <span style="color: #e0e0e0;">${data[3].toFixed(2)}</span></div>
                <div>最高: <span style="color: #e0e0e0;">${data[4].toFixed(2)}</span></div>
                <div>涨跌: <span style="color: ${isPositive ? '#00d4aa' : '#ff4757'}; font-weight: 600;">${isPositive ? '+' : ''}${change.toFixed(2)} (${changePercent}%)</span></div>
                <div>成交量: <span style="color: #e0e0e0;">${volume.toFixed(2)}</span></div>
              </div>
            </div>
          `;
        }
      },
      axisPointer: {
        link: { xAxisIndex: 'all' },
        label: {
          backgroundColor: '#00d4aa',
          color: '#000'
        }
      },
      grid: [
        {
          left: '3%',
          right: '3%',
          height: '65%',
          top: '15%',
          backgroundColor: 'rgba(0, 212, 170, 0.02)',
          borderColor: 'rgba(0, 212, 170, 0.1)',
          borderWidth: 1
        },
        {
          left: '3%',
          right: '3%',
          top: '85%',
          height: '10%'
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: chartData.map(item => item[0]),
          scale: true,
          boundaryGap: false,
          axisLine: { 
            onZero: false,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          splitLine: { 
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.05)',
              type: 'dashed'
            }
          },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax',
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 10
          },
          axisTick: {
            show: false
          }
        },
        {
          type: 'category',
          gridIndex: 1,
          data: chartData.map(item => item[0]),
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax',
          axisLabel: { show: false },
          axisTick: { show: false }
        }
      ],
      yAxis: [
        {
          scale: true,
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(0, 212, 170, 0.02)', 'rgba(255, 255, 255, 0.01)']
            }
          },
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
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 50,
          end: 100,
          zoomLock: false
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          top: '97%',
          start: 50,
          end: 100,
          height: 20,
          borderColor: 'rgba(0, 212, 170, 0.3)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          fillerColor: 'rgba(0, 212, 170, 0.1)',
          handleStyle: {
            color: '#00d4aa',
            borderColor: '#00d4aa'
          },
          textStyle: {
            color: '#ffffff',
            fontSize: 10
          }
        }
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: chartData.map(item => item.slice(1, 5)),
          itemStyle: {
            color: '#ff4757',
            color0: '#00d4aa',
            borderColor: '#ff4757',
            borderColor0: '#00d4aa',
            borderWidth: 1
          },
          emphasis: {
            itemStyle: {
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 212, 170, 0.5)'
            }
          }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: chartData.map(item => item[5]),
          itemStyle: {
            color: function(params: any) {
              const data = chartData[params.dataIndex];
              return data[2] >= data[1] ? 'rgba(0, 212, 170, 0.6)' : 'rgba(255, 71, 87, 0.6)';
            },
            borderRadius: [2, 2, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: function(params: any) {
                const data = chartData[params.dataIndex];
                return data[2] >= data[1] ? 'rgba(0, 212, 170, 0.8)' : 'rgba(255, 71, 87, 0.8)';
              }
            }
          }
        }
      ]
    };

    chartRef.current.setOption(option);
  }, [data]);

  // 格式化价格
  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  // 计算涨跌幅
  const calculateChange = () => {
    if (data.length < 2) return { change: 0, percent: 0 };
    const current = data[data.length - 1].close;
    const previous = data[data.length - 2].close;
    const change = current - previous;
    const percent = (change / previous) * 100;
    return { change, percent };
  };

  const { change, percent } = calculateChange();
  const isPositive = change >= 0;

  return (
    <div className="candlestick-chart-container">
      <div className="chart-header">
        <div className="symbol-info">
          <h3>{symbol}</h3>
          <div className="price-info">
            <span className="current-price">
              {data.length > 0 ? formatPrice(data[data.length - 1].close) : '--'}
            </span>
            <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)} ({percent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="timeframe-selector">
          {timeframes.map(tf => (
            <button
              key={tf}
              className={`timeframe-btn ${selectedTimeframe === tf ? 'active' : ''}`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-content">
        <div ref={chartContainerRef} className="echarts-chart" style={{ width: width, height: height }} />
      </div>

      <div className="chart-info">
        <div className="info-item">
          <span className="label">开盘</span>
          <span className="value">{data.length > 0 ? formatPrice(data[data.length - 1].open) : '--'}</span>
        </div>
        <div className="info-item">
          <span className="label">最高</span>
          <span className="value positive">{data.length > 0 ? formatPrice(data[data.length - 1].high) : '--'}</span>
        </div>
        <div className="info-item">
          <span className="label">最低</span>
          <span className="value negative">{data.length > 0 ? formatPrice(data[data.length - 1].low) : '--'}</span>
        </div>
        <div className="info-item">
          <span className="label">收盘</span>
          <span className={`value ${isPositive ? 'positive' : 'negative'}`}>
            {data.length > 0 ? formatPrice(data[data.length - 1].close) : '--'}
          </span>
        </div>
        <div className="info-item">
          <span className="label">成交量</span>
          <span className="value">{data.length > 0 ? data[data.length - 1].volume.toFixed(2) : '--'}</span>
        </div>
      </div>

      <style jsx>{`
        .candlestick-chart-container {
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

        .candlestick-chart-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.5), transparent);
        }

        .chart-header {
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

        .price-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .current-price {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
        }

        .price-change {
          font-size: 14px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .price-change.positive {
          background: rgba(0, 212, 170, 0.2);
          color: #00d4aa;
          border: 1px solid rgba(0, 212, 170, 0.3);
        }

        .price-change.negative {
          background: rgba(255, 71, 87, 0.2);
          color: #ff4757;
          border: 1px solid rgba(255, 71, 87, 0.3);
        }

        .timeframe-selector {
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .timeframe-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .timeframe-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .timeframe-btn.active {
          background: linear-gradient(135deg, #00d4aa, #00b894);
          color: #000000;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 212, 170, 0.3);
        }

        .chart-content {
          margin-bottom: 20px;
          position: relative;
        }

        .echarts-chart {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .chart-info {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .info-item .label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-item .value {
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
        }

        .info-item .value.positive {
          color: #00d4aa;
        }

        .info-item .value.negative {
          color: #ff4757;
        }
      `}</style>
    </div>
  );
};

export default CandlestickChart; 