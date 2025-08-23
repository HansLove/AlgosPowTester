// Configuration and asset definitions
export const ASSETS = {
  bitcoin: {
    name: 'Bitcoin (BTC)',
    symbol: 'BTC',
    defaultPrice: 50000,
    defaultVolatility: 0.025,
    defaultDrift: 0.0003,
    color: '#f7931a'
  },
  gold: {
    name: 'Gold (XAU)',
    symbol: 'XAU',
    defaultPrice: 2000,
    defaultVolatility: 0.015,
    defaultDrift: 0.0001,
    color: '#ffd700'
  },
  sp500: {
    name: 'S&P 500 Index',
    symbol: 'SPX',
    defaultPrice: 4500,
    defaultVolatility: 0.018,
    defaultDrift: 0.0002,
    color: '#00d4aa'
  },
  nasdaq: {
    name: 'NASDAQ Composite',
    symbol: 'NDX',
    defaultPrice: 15000,
    defaultVolatility: 0.022,
    defaultDrift: 0.00025,
    color: '#007acc'
  },
  ethereum: {
    name: 'Ethereum (ETH)',
    symbol: 'ETH',
    defaultPrice: 3000,
    defaultVolatility: 0.028,
    defaultDrift: 0.0004,
    color: '#627eea'
  },
  usd: {
    name: 'US Dollar Index',
    symbol: 'DXY',
    defaultPrice: 100,
    defaultVolatility: 0.008,
    defaultDrift: 0.00005,
    color: '#85bb65'
  }
};

export const DEFAULT_SETTINGS = {
  candles: 1000,
  seed: 'markets-2025',
  fee: 0.001,
  initialCapital: 10000,
  minCandles: 50,
  maxCandles: 10000
};

export const STRATEGY_TEMPLATES = {
  ma: {
    name: 'Moving Average Crossover',
    description: 'Buy when fast MA crosses above slow MA, sell when it crosses below',
    params: {
      fastMA: { value: 10, min: 1, max: 100, step: 1, label: 'Fast MA Period' },
      slowMA: { value: 30, min: 2, max: 200, step: 1, label: 'Slow MA Period' }
    }
  },
  rsi: {
    name: 'RSI Mean Reversion',
    description: 'Buy oversold (RSI < 30), sell overbought (RSI > 70)',
    params: {
      period: { value: 14, min: 2, max: 50, step: 1, label: 'RSI Period' },
      buyThreshold: { value: 30, min: 10, max: 40, step: 1, label: 'Buy Below' },
      sellThreshold: { value: 70, min: 60, max: 90, step: 1, label: 'Sell Above' }
    }
  },
  bollinger: {
    name: 'Bollinger Bands',
    description: 'Buy at lower band, sell at upper band',
    params: {
      period: { value: 20, min: 5, max: 100, step: 1, label: 'Period' },
      stdDev: { value: 2, min: 1, max: 3, step: 0.1, label: 'Standard Deviation' }
    }
  },
  macd: {
    name: 'MACD Crossover',
    description: 'Buy on bullish crossover, sell on bearish crossover',
    params: {
      fastEMA: { value: 12, min: 5, max: 50, step: 1, label: 'Fast EMA' },
      slowEMA: { value: 26, min: 10, max: 100, step: 1, label: 'Slow EMA' },
      signal: { value: 9, min: 3, max: 20, step: 1, label: 'Signal Period' }
    }
  }
};
