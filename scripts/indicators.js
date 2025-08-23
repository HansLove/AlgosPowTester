// Technical indicators and analysis tools
export class TechnicalIndicators {
  // Simple Moving Average
  static sma(data, period, index) {
    if (index + 1 < period) return NaN;
    let sum = 0;
    for (let k = index - period + 1; k <= index; k++) {
      sum += data[k];
    }
    return sum / period;
  }

  // Exponential Moving Average
  static ema(data, period, index) {
    if (index < 0) return NaN;
    const k = 2 / (period + 1);
    let ema = data[0];
    
    for (let t = 1; t <= index; t++) {
      ema = data[t] * k + ema * (1 - k);
    }
    return ema;
  }

  // Relative Strength Index
  static rsi(data, period, index) {
    if (index < period) return NaN;
    
    let gains = 0, losses = 0;
    for (let k = index - period + 1; k <= index; k++) {
      const change = data[k] - data[k - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / (avgLoss || 1e-9);
    return 100 - (100 / (1 + rs));
  }

  // Bollinger Bands
  static bollingerBands(data, period, stdDev, index) {
    if (index + 1 < period) return { upper: NaN, middle: NaN, lower: NaN };
    
    const sma = this.sma(data, period, index);
    let sumSquared = 0;
    
    for (let k = index - period + 1; k <= index; k++) {
      sumSquared += Math.pow(data[k] - sma, 2);
    }
    
    const standardDeviation = Math.sqrt(sumSquared / period);
    const upper = sma + (stdDev * standardDeviation);
    const lower = sma - (stdDev * standardDeviation);
    
    return { upper, middle: sma, lower };
  }

  // MACD (Moving Average Convergence Divergence)
  static macd(data, fastPeriod, slowPeriod, signalPeriod, index) {
    if (index < Math.max(fastPeriod, slowPeriod)) return { macd: NaN, signal: NaN, histogram: NaN };
    
    const fastEMA = this.ema(data, fastPeriod, index);
    const slowEMA = this.ema(data, slowPeriod, index);
    const macdLine = fastEMA - slowEMA;
    
    // Calculate signal line (EMA of MACD)
    if (index < slowPeriod + signalPeriod - 1) return { macd: macdLine, signal: NaN, histogram: NaN };
    
    // We need to calculate MACD values for signal line
    const macdValues = [];
    for (let i = slowPeriod - 1; i <= index; i++) {
      const fast = this.ema(data, fastPeriod, i);
      const slow = this.ema(data, slowPeriod, i);
      macdValues.push(fast - slow);
    }
    
    const signalLine = this.ema(macdValues, signalPeriod, macdValues.length - 1);
    const histogram = macdLine - signalLine;
    
    return { macd: macdLine, signal: signalLine, histogram };
  }

  // Stochastic Oscillator
  static stochastic(data, period, index) {
    if (index < period) return { k: NaN, d: NaN };
    
    let highest = data[index];
    let lowest = data[index];
    
    for (let k = index - period + 1; k <= index; k++) {
      highest = Math.max(highest, data[k]);
      lowest = Math.min(lowest, data[k]);
    }
    
    const k = ((data[index] - lowest) / (highest - lowest)) * 100;
    
    // Calculate %D (3-period SMA of %K)
    if (index < period + 2) return { k, d: NaN };
    
    const kValues = [];
    for (let i = index - 2; i <= index; i++) {
      let h = data[i], l = data[i];
      for (let j = i - period + 1; j <= i; j++) {
        h = Math.max(h, data[j]);
        l = Math.min(l, data[j]);
      }
      kValues.push(((data[i] - l) / (h - l)) * 100);
    }
    
    const d = kValues.reduce((a, b) => a + b, 0) / kValues.length;
    
    return { k, d };
  }

  // Williams %R
  static williamsR(data, period, index) {
    if (index < period) return NaN;
    
    let highest = data[index];
    let lowest = data[index];
    
    for (let k = index - period + 1; k <= index; k++) {
      highest = Math.max(highest, data[k]);
      lowest = Math.min(lowest, data[k]);
    }
    
    return ((highest - data[index]) / (highest - lowest)) * -100;
  }

  // Average True Range (ATR)
  static atr(high, low, close, period, index) {
    if (index < period) return NaN;
    
    const trueRanges = [];
    for (let i = index - period + 1; i <= index; i++) {
      const tr1 = high[i] - low[i];
      const tr2 = Math.abs(high[i] - close[i - 1]);
      const tr3 = Math.abs(low[i] - close[i - 1]);
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return trueRanges.reduce((a, b) => a + b, 0) / period;
  }

  // Commodity Channel Index (CCI)
  static cci(high, low, close, period, index) {
    if (index < period) return NaN;
    
    const typicalPrices = [];
    for (let k = index - period + 1; k <= index; k++) {
      typicalPrices.push((high[k] + low[k] + close[k]) / 3);
    }
    
    const sma = typicalPrices.reduce((a, b) => a + b, 0) / period;
    let sumDeviation = 0;
    
    for (let k = 0; k < typicalPrices.length; k++) {
      sumDeviation += Math.abs(typicalPrices[k] - sma);
    }
    
    const meanDeviation = sumDeviation / period;
    const currentTP = (high[index] + low[index] + close[index]) / 3;
    
    return (currentTP - sma) / (0.015 * meanDeviation);
  }

  // Rate of Change (ROC)
  static roc(data, period, index) {
    if (index < period) return NaN;
    return ((data[index] - data[index - period]) / data[index - period]) * 100;
  }

  // Money Flow Index (MFI)
  static mfi(high, low, close, volume, period, index) {
    if (index < period) return NaN;
    
    const moneyFlows = [];
    for (let k = index - period + 1; k <= index; k++) {
      const typicalPrice = (high[k] + low[k] + close[k]) / 3;
      const prevTypicalPrice = (high[k - 1] + low[k - 1] + close[k - 1]) / 3;
      
      if (typicalPrice > prevTypicalPrice) {
        moneyFlows.push(typicalPrice * volume[k]);
      } else {
        moneyFlows.push(-typicalPrice * volume[k]);
      }
    }
    
    const positiveFlow = moneyFlows.filter(f => f > 0).reduce((a, b) => a + b, 0);
    const negativeFlow = Math.abs(moneyFlows.filter(f => f < 0).reduce((a, b) => a + b, 0));
    
    const moneyRatio = positiveFlow / (negativeFlow || 1e-9);
    return 100 - (100 / (1 + moneyRatio));
  }

  // Parabolic SAR
  static parabolicSAR(high, low, acceleration = 0.02, maximum = 0.2) {
    const sar = new Array(high.length);
    let af = acceleration;
    let ep = low[0];
    let long = true;
    
    sar[0] = low[0];
    
    for (let i = 1; i < high.length; i++) {
      if (long) {
        if (low[i] < ep) {
          long = false;
          sar[i] = ep;
          ep = high[i];
          af = acceleration;
        } else {
          sar[i] = sar[i - 1];
          if (high[i] > ep) {
            ep = high[i];
            af = Math.min(af + acceleration, maximum);
          }
        }
      } else {
        if (high[i] > ep) {
          long = true;
          sar[i] = ep;
          ep = low[i];
          af = acceleration;
        } else {
          sar[i] = sar[i - 1];
          if (low[i] < ep) {
            ep = low[i];
            af = Math.min(af + acceleration, maximum);
          }
        }
      }
      
      if (long) {
        sar[i] = Math.min(sar[i], low[i - 1], low[i - 2] || low[i - 1]);
      } else {
        sar[i] = Math.max(sar[i], high[i - 1], high[i - 2] || high[i - 1]);
      }
    }
    
    return sar;
  }
}

// Helper functions for common calculations
export const Helpers = {
  // Legacy compatibility
  sma: TechnicalIndicators.sma,
  ema: TechnicalIndicators.ema,
  rsi: TechnicalIndicators.rsi,
  
  // Additional helpers
  clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
  
  // Calculate returns
  returns: (prices) => {
    const returns = new Array(prices.length).fill(0);
    for (let i = 1; i < prices.length; i++) {
      returns[i] = Math.log(prices[i] / prices[i - 1]);
    }
    return returns;
  },
  
  // Calculate cumulative returns
  cumulativeReturns: (returns) => {
    const cumulative = new Array(returns.length).fill(0);
    for (let i = 1; i < returns.length; i++) {
      cumulative[i] = cumulative[i - 1] + returns[i];
    }
    return cumulative;
  }
};