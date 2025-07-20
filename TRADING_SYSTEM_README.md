# 实时交易系统

这是一个完整的实时交易页面系统，包含订单簿、交易面板、成交记录、K线图表和深度图等功能。

## 功能特性

### 1. 实时交易页面开发

#### 订单簿组件 (`OrderBook.tsx`)
- ✅ 实现买卖盘数据的实时展示
- ✅ 支持10/20档位切换
- ✅ 动态计算累计数量
- ✅ 可视化深度图显示
- ✅ 点击价格自动填充交易面板

#### 交易面板 (`TradingPanel.tsx`)
- ✅ 开发限价单、市价单交易功能
- ✅ 包含价格输入、数量计算
- ✅ 滑块控制数量百分比
- ✅ 实时计算交易金额和手续费
- ✅ 输入验证和错误处理

#### 成交记录 (`TradeHistory.tsx`)
- ✅ 实时显示最新成交信息
- ✅ 支持分页和筛选（全部/买入/卖出）
- ✅ 24小时统计数据（成交量、最高价、最低价、涨跌幅）
- ✅ 可配置每页显示数量

### 2. WebSocket实时通信系统

#### 连接管理 (`useWebSocket.ts`)
- ✅ 实现WebSocket连接建立
- ✅ 断线重连机制
- ✅ 心跳检测机制
- ✅ 多主题订阅功能

#### 数据订阅
- ✅ 价格更新订阅
- ✅ 订单簿变化订阅
- ✅ 成交记录订阅

### 3. 图表系统集成

#### K线图表 (`CandlestickChart.tsx`)
- ✅ 集成TradingView图表库
- ✅ 实现多时间周期K线图展示（1m, 5m, 15m, 1h, 4h, 1d）
- ✅ 实时数据更新
- ✅ 响应式设计

#### 深度图 (`DepthChart.tsx`)
- ✅ 基于ECharts开发订单簿深度图
- ✅ 可视化买卖盘数据分布
- ✅ 实时更新和动画效果

### 4. 数据精度处理

#### 数学计算 (`mathUtils.ts`)
- ✅ 使用MathJS库处理高精度金融计算
- ✅ 避免JavaScript浮点数精度问题
- ✅ 价格格式化功能
- ✅ 数量格式化功能
- ✅ 输入验证和错误处理机制

## 技术栈

- **前端框架**: Next.js 15 + React 19
- **样式**: CSS-in-JS (styled-jsx)
- **图表库**: 
  - TradingView Lightweight Charts (K线图)
  - ECharts (深度图)
- **数学计算**: MathJS
- **WebSocket**: 原生WebSocket API
- **状态管理**: React Hooks
- **类型安全**: TypeScript

## 项目结构

```
src/
├── app/
│   ├── trading/
│   │   └── page.tsx          # 主交易页面
│   └── page.tsx              # 首页
├── components/
│   ├── OrderBook.tsx         # 订单簿组件
│   ├── TradingPanel.tsx      # 交易面板组件
│   ├── TradeHistory.tsx      # 成交记录组件
│   ├── CandlestickChart.tsx  # K线图表组件
│   └── DepthChart.tsx        # 深度图组件
├── hooks/
│   └── useWebSocket.ts       # WebSocket连接管理
├── utils/
│   ├── mathUtils.ts          # 数学计算工具
│   └── mockData.ts           # 模拟数据生成器
└── styles/                   # 样式文件
```

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 访问应用：
- 首页: http://localhost:3000
- 交易页面: http://localhost:3000/trading

## 使用说明

### 访问交易页面
1. 打开首页
2. 点击"进入实时交易页面"按钮
3. 或者直接访问 `/trading` 路径

### 使用订单簿
- 查看买卖盘数据
- 切换10/20档位显示
- 点击价格自动填充交易面板
- 开启/关闭深度图显示

### 进行交易
1. 选择买入或卖出
2. 选择限价单或市价单
3. 输入价格和数量（或使用滑块）
4. 查看实时计算的金额和手续费
5. 点击提交订单

### 查看图表
- K线图：切换不同时间周期
- 深度图：查看买卖盘分布
- 成交记录：筛选和分页查看

## 数据说明

当前系统使用模拟数据：
- 基础价格：50,000 USDT
- 实时更新频率：1秒
- 数据范围：100条历史记录

## 自定义配置

### 修改价格配置
在 `mathUtils.ts` 中修改 `DEFAULT_PRICE_CONFIG`：
```typescript
export const DEFAULT_PRICE_CONFIG: PriceConfig = {
  symbol: 'BTC/USDT',
  pricePrecision: 2,
  quantityPrecision: 6,
  minQuantity: 0.000001,
  maxQuantity: 1000000,
  minPrice: 0.01,
  maxPrice: 1000000
};
```

### 修改WebSocket配置
在 `useWebSocket.ts` 中修改连接参数：
```typescript
const { isConnected, error } = useWebSocket({
  url: 'your-websocket-url',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000
});
```

## 扩展功能

### 添加新的交易对
1. 修改 `mockData.ts` 中的基础价格
2. 更新组件中的symbol显示
3. 调整价格和数量精度

### 集成真实API
1. 替换WebSocket连接地址
2. 修改数据格式适配
3. 添加API认证

### 添加更多图表
1. 创建新的图表组件
2. 集成相应的图表库
3. 在交易页面中集成

## 注意事项

1. **精度处理**: 所有金融计算都使用MathJS确保精度
2. **性能优化**: 大量数据时考虑虚拟滚动
3. **错误处理**: 网络断开时自动重连
4. **响应式设计**: 支持不同屏幕尺寸

## 许可证

MIT License 