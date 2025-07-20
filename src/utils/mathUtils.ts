import * as math from 'mathjs';

// 配置MathJS精度
(math as any).config({
  number: 'BigNumber',
  precision: 20
});

export interface PriceConfig {
  symbol: string;
  pricePrecision: number;
  quantityPrecision: number;
  minQuantity: number;
  maxQuantity: number;
  minPrice: number;
  maxPrice: number;
}

// 默认价格配置
export const DEFAULT_PRICE_CONFIG: PriceConfig = {
  symbol: 'BTC/USDT',
  pricePrecision: 2,
  quantityPrecision: 6,
  minQuantity: 0.000001,
  maxQuantity: 1000000,
  minPrice: 0.01,
  maxPrice: 1000000
};

// 高精度加法
export const add = (a: number | string, b: number | string): string => {
  return math.add(math.bignumber(a), math.bignumber(b)).toString();
};

// 高精度减法
export const subtract = (a: number | string, b: number | string): string => {
  return math.subtract(math.bignumber(a), math.bignumber(b)).toString();
};

// 高精度乘法
export const multiply = (a: number | string, b: number | string): string => {
  return math.multiply(math.bignumber(a), math.bignumber(b)).toString();
};

// 高精度除法
export const divide = (a: number | string, b: number | string): string => {
  if (math.equal(math.bignumber(b), 0)) {
    throw new Error('Division by zero');
  }
  return math.divide(math.bignumber(a), math.bignumber(b)).toString();
};

// 高精度比较
export const compare = (a: number | string, b: number | string): number => {
  return math.compare(math.bignumber(a), math.bignumber(b)) as number;
};

// 格式化价格
export const formatPrice = (price: number | string, precision: number = 2): string => {
  const num = math.bignumber(price);
  return math.format(num, { precision });
};

// 格式化数量
export const formatQuantity = (quantity: number | string, precision: number = 6): string => {
  const num = math.bignumber(quantity);
  return math.format(num, { precision });
};

// 计算百分比变化
export const calculatePercentageChange = (current: number | string, previous: number | string): string => {
  if (math.equal(math.bignumber(previous), 0)) {
    return '0';
  }
  const change = math.subtract(math.bignumber(current), math.bignumber(previous));
  const percentage = math.multiply(
    math.divide(change, math.bignumber(previous)),
    100
  );
  return math.format(percentage, { precision: 2 });
};

// 计算累计数量
export const calculateCumulativeQuantity = (orders: Array<{ price: number | string; quantity: number | string }>): Array<{ price: string; quantity: string; cumulative: string }> => {
  let cumulative = math.bignumber(0);
  
  return orders.map(order => {
    cumulative = math.add(cumulative, math.bignumber(order.quantity));
    return {
      price: formatPrice(order.price),
      quantity: formatQuantity(order.quantity),
      cumulative: formatQuantity(cumulative)
    };
  });
};

// 验证价格输入
export const validatePrice = (price: string, config: PriceConfig): { isValid: boolean; error?: string } => {
  try {
    const num = math.bignumber(price);
    
    if (math.smaller(num, config.minPrice)) {
      return { isValid: false, error: `价格不能低于 ${config.minPrice}` };
    }
    
    if (math.larger(num, config.maxPrice)) {
      return { isValid: false, error: `价格不能高于 ${config.maxPrice}` };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: '无效的价格格式' };
  }
};

// 验证数量输入
export const validateQuantity = (quantity: string, config: PriceConfig): { isValid: boolean; error?: string } => {
  try {
    const num = math.bignumber(quantity);
    
    if (math.smaller(num, config.minQuantity)) {
      return { isValid: false, error: `数量不能低于 ${config.minQuantity}` };
    }
    
    if (math.larger(num, config.maxQuantity)) {
      return { isValid: false, error: `数量不能高于 ${config.maxQuantity}` };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: '无效的数量格式' };
  }
};

// 计算交易金额
export const calculateAmount = (price: number | string, quantity: number | string): string => {
  return multiply(price, quantity);
};

// 计算手续费
export const calculateFee = (amount: number | string, feeRate: number = 0.001): string => {
  return multiply(amount, feeRate.toString());
};

// 计算实际到账数量（扣除手续费）
export const calculateNetAmount = (amount: number | string, feeRate: number = 0.001): string => {
  const fee = calculateFee(amount, feeRate);
  return subtract(amount, fee);
};

// 计算滑点
export const calculateSlippage = (expectedPrice: number | string, actualPrice: number | string): string => {
  const slippage = math.abs(
    math.divide(
      math.subtract(math.bignumber(expectedPrice), math.bignumber(actualPrice)),
      math.bignumber(expectedPrice)
    )
  );
  return math.format(math.multiply(slippage, 100), { precision: 4 }) as string;
};

// 格式化货币显示
export const formatCurrency = (amount: number | string, currency: string = 'USDT', precision: number = 2): string => {
  const num = math.bignumber(amount);
  const formatted = math.format(num, { precision });
  
  switch (currency) {
    case 'USDT':
      return `$${formatted}`;
    case 'BTC':
      return `${formatted} BTC`;
    case 'ETH':
      return `${formatted} ETH`;
    default:
      return `${formatted} ${currency}`;
  }
};

// 格式化百分比
export const formatPercentage = (value: number | string, precision: number = 2): string => {
  const num = math.bignumber(value);
  return `${math.format(num, { precision })}%`;
};

// 计算加权平均价格
export const calculateVWAP = (orders: Array<{ price: number | string; quantity: number | string }>): string => {
  if (orders.length === 0) return '0';
  
  let totalValue = math.bignumber(0);
  let totalQuantity = math.bignumber(0);
  
  orders.forEach(order => {
    const value = multiply(order.price, order.quantity);
    totalValue = math.add(totalValue, math.bignumber(value));
    totalQuantity = math.add(totalQuantity, math.bignumber(order.quantity));
  });
  
  if (math.equal(totalQuantity, 0)) return '0';
  
  return divide(totalValue.toString(), totalQuantity.toString());
}; 