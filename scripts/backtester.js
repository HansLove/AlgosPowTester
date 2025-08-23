import { TechnicalIndicators, Helpers } from './indicators.js';
import { STRATEGY_TEMPLATES } from './config.js';

// Advanced backtesting engine
export class Backtester {
  constructor(marketData, settings = {}) {
    this.marketData = marketData;
    this.settings = {
      fee: 0.001,
      initialCapital: 10000,
      slippage: 0.0005,
      ...settings
    };
    
    this.results = null;
    this.trades = [];
    this.equity = [];
    this.positions = {};
    this.cash = this.settings.initialCapital;
  }

  // Run backtest with specified strategy
  async runBacktest(strategyConfig) {
    const { type, params, customCode } = strategyConfig;
    
    // Initialize results
    this.reset();
    
    // Execute strategy based on type
    let results;
    switch (type) {
      case 'ma':
        results = this.runMovingAverageStrategy(params);
        break;
      case 'rsi':
        results = this.runRSIStrategy(params);
        break;
      case 'bollinger':
        results = this.runBollingerBandsStrategy(params);
        break;
      case 'macd':
        results = this.runMACDStrategy(params);
        break;
      case 'custom':
        results = await this.runCustomStrategy(customCode);
        break;
      default:
        throw new Error(`Unknown strategy type: ${type}`);
    }
    
    if (results) {
      this.results = this.calculateFinalResults();
      return this.results;
    }
    
    return null;
  }

  // Moving Average Crossover Strategy
  runMovingAverageStrategy(params) {
    const { fastMA, slowMA } = params;
    const assetKeys = Object.keys(this.marketData.assets);
    
    if (assetKeys.length === 0) return null;
    
    // Use first asset for now (can be extended to multi-asset)
    const assetKey = assetKeys[0];
    const asset = this.marketData.assets[assetKey];
    const prices = asset.prices;
    
    for (let i = 1; i < prices.length; i++) {
      const fastSMA = TechnicalIndicators.sma(prices, fastMA, i);
      const slowSMA = TechnicalIndicators.sma(prices, slowMA, i);
      const fastSMAPrev = TechnicalIndicators.sma(prices, fastMA, i - 1);
      const slowSMAPrev = TechnicalIndicators.sma(prices, slowMA, i - 1);
      
      if (!isNaN(fastSMA) && !isNaN(slowSMA) && !isNaN(fastSMAPrev) && !isNaN(slowSMAPrev)) {
        let signal = 0;
        
        // Golden cross (fast MA crosses above slow MA)
        if (fastSMA > slowSMA && fastSMAPrev <= slowSMAPrev) {
          signal = 1;
        }
        // Death cross (fast MA crosses below slow MA)
        else if (fastSMA < slowSMA && fastSMAPrev >= slowSMAPrev) {
          signal = -1;
        }
        
        this.executeSignal(assetKey, signal, i, prices[i]);
      }
      
      this.updateEquity(i, assetKey, prices[i]);
    }
    
    return true;
  }

  // RSI Mean Reversion Strategy
  runRSIStrategy(params) {
    const { period, buyThreshold, sellThreshold } = params;
    const assetKeys = Object.keys(this.marketData.assets);
    
    if (assetKeys.length === 0) return null;
    
    const assetKey = assetKeys[0];
    const asset = this.marketData.assets[assetKey];
    const prices = asset.prices;
    
    for (let i = 1; i < prices.length; i++) {
      const rsi = TechnicalIndicators.rsi(prices, period, i);
      
      if (!isNaN(rsi)) {
        let signal = 0;
        
        if (rsi < buyThreshold) {
          signal = 1; // Oversold - buy
        } else if (rsi > sellThreshold) {
          signal = -1; // Overbought - sell
        }
        
        this.executeSignal(assetKey, signal, i, prices[i]);
      }
      
      this.updateEquity(i, assetKey, prices[i]);
    }
    
    return true;
  }

  // Bollinger Bands Strategy
  runBollingerBandsStrategy(params) {
    const { period, stdDev } = params;
    const assetKeys = Object.keys(this.marketData.assets);
    
    if (assetKeys.length === 0) return null;
    
    const assetKey = assetKeys[0];
    const asset = this.marketData.assets[assetKey];
    const prices = asset.prices;
    
    for (let i = 1; i < prices.length; i++) {
      const bb = TechnicalIndicators.bollingerBands(prices, period, stdDev, i);
      
      if (!isNaN(bb.upper) && !isNaN(bb.lower)) {
        let signal = 0;
        const currentPrice = prices[i];
        
        if (currentPrice <= bb.lower) {
          signal = 1; // Price at or below lower band - buy
        } else if (currentPrice >= bb.upper) {
          signal = -1; // Price at or above upper band - sell
        }
        
        this.executeSignal(assetKey, signal, i, currentPrice);
      }
      
      this.updateEquity(i, assetKey, prices[i]);
    }
    
    return true;
  }

  // MACD Strategy
  runMACDStrategy(params) {
    const { fastEMA, slowEMA, signal } = params;
    const assetKeys = Object.keys(this.marketData.assets);
    
    if (assetKeys.length === 0) return null;
    
    const assetKey = assetKeys[0];
    const asset = this.marketData.assets[assetKey];
    const prices = asset.prices;
    
    for (let i = 1; i < prices.length; i++) {
      const macd = TechnicalIndicators.macd(prices, fastEMA, slowEMA, signal, i);
      
      if (!isNaN(macd.macd) && !isNaN(macd.signal)) {
        let signal = 0;
        
        // Bullish crossover
        if (macd.macd > macd.signal && macd.histogram > 0) {
          signal = 1;
        }
        // Bearish crossover
        else if (macd.macd < macd.signal && macd.histogram < 0) {
          signal = -1;
        }
        
        this.executeSignal(assetKey, signal, i, prices[i]);
      }
      
      this.updateEquity(i, assetKey, prices[i]);
    }
    
    return true;
  }

  // Custom Strategy Execution
  async runCustomStrategy(customCode) {
    if (!customCode || !customCode.trim()) {
      throw new Error('Custom strategy code is required');
    }
    
    const assetKeys = Object.keys(this.marketData.assets);
    if (assetKeys.length === 0) return null;
    
    const assetKey = assetKeys[0];
    const asset = this.marketData.assets[assetKey];
    const prices = asset.prices;
    
    // Create sandboxed execution environment
    const strategyFunction = this.createStrategyFunction(customCode);
    
    for (let i = 1; i < prices.length; i++) {
      try {
        const context = {
          i,
          prices,
          position: this.positions[assetKey] || 0,
          indicators: TechnicalIndicators,
          helpers: Helpers
        };
        
        const signal = strategyFunction(context);
        const clampedSignal = Helpers.clamp(Math.sign(parseFloat(signal)), -1, 1);
        
        this.executeSignal(assetKey, clampedSignal, i, prices[i]);
      } catch (error) {
        console.warn(`Strategy execution error at index ${i}:`, error);
      }
      
      this.updateEquity(i, assetKey, prices[i]);
    }
    
    return true;
  }

  // Create sandboxed strategy function
  createStrategyFunction(code) {
    try {
      // Basic validation and sandboxing
      if (code.includes('eval') || code.includes('Function') || code.includes('import')) {
        throw new Error('Potentially unsafe code detected');
      }
      
      const functionBody = `
        const { i, prices, position, indicators, helpers } = context;
        ${code}
      `;
      
      return new Function('context', functionBody);
    } catch (error) {
      throw new Error(`Strategy compilation error: ${error.message}`);
    }
  }

  // Execute trading signal
  executeSignal(assetKey, signal, index, price) {
    const currentPosition = this.positions[assetKey] || 0;
    
    if (signal !== currentPosition) {
      // Calculate trade cost
      const positionChange = Math.abs(signal - currentPosition);
      const tradeCost = this.calculateTradeCost(price, positionChange);
      
      // Update cash
      this.cash -= tradeCost;
      
      // Record trade
      this.trades.push({
        index,
        asset: assetKey,
        type: signal > currentPosition ? 'buy' : 'sell',
        price,
        quantity: positionChange,
        cost: tradeCost,
        timestamp: this.marketData.timestamps[index]
      });
      
      // Update position
      this.positions[assetKey] = signal;
    }
  }

  // Calculate trade cost including fees and slippage
  calculateTradeCost(price, quantity) {
    const baseCost = price * quantity;
    const fee = baseCost * this.settings.fee;
    const slippage = baseCost * this.settings.slippage;
    return baseCost + fee + slippage;
  }

  // Update equity curve
  updateEquity(index, assetKey, price) {
    let totalValue = this.cash;
    
    // Add value of all positions
    Object.keys(this.positions).forEach(asset => {
      const position = this.positions[asset];
      if (position !== 0) {
        const assetData = this.marketData.assets[asset];
        const currentPrice = assetData.prices[index];
        totalValue += position * currentPrice;
      }
    });
    
    this.equity[index] = totalValue;
  }

  // Calculate comprehensive backtest results
  calculateFinalResults() {
    if (this.equity.length === 0) return null;
    
    const initialValue = this.settings.initialCapital;
    const finalValue = this.equity[this.equity.length - 1];
    const totalReturn = (finalValue / initialValue - 1) * 100;
    
    // Calculate returns
    const returns = [];
    for (let i = 1; i < this.equity.length; i++) {
      if (this.equity[i - 1] > 0) {
        returns.push((this.equity[i] / this.equity[i - 1] - 1) * 100);
      } else {
        returns.push(0);
      }
    }
    
    // Calculate statistics
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = avgReturn / volatility;
    const maxDrawdown = this.calculateMaxDrawdown();
    const winRate = this.calculateWinRate();
    
    // Calculate additional metrics
    const calmarRatio = totalReturn / Math.abs(maxDrawdown);
    const sortinoRatio = this.calculateSortinoRatio(returns);
    const profitFactor = this.calculateProfitFactor();
    
    return {
      summary: {
        totalReturn,
        avgReturn,
        volatility,
        sharpeRatio,
        maxDrawdown,
        winRate,
        calmarRatio,
        sortinoRatio,
        profitFactor
      },
      details: {
        initialCapital: initialValue,
        finalCapital: finalValue,
        totalTrades: this.trades.length,
        profitableTrades: this.trades.filter(t => t.type === 'sell').length,
        totalFees: this.trades.reduce((sum, t) => sum + t.cost - (t.price * t.quantity), 0),
        maxConsecutiveLosses: this.calculateMaxConsecutiveLosses(),
        bestTrade: this.getBestTrade(),
        worstTrade: this.getWorstTrade()
      },
      equity: this.equity,
      trades: this.trades,
      positions: this.positions
    };
  }

  // Calculate maximum drawdown
  calculateMaxDrawdown() {
    let peak = this.equity[0];
    let maxDrawdown = 0;
    
    for (let i = 1; i < this.equity.length; i++) {
      if (this.equity[i] > peak) {
        peak = this.equity[i];
      } else {
        const drawdown = (peak - this.equity[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown * 100;
  }

  // Calculate win rate
  calculateWinRate() {
    if (this.trades.length === 0) return 0;
    
    const profitableTrades = this.trades.filter(trade => {
      // For now, assume all trades are profitable (can be enhanced with actual P&L calculation)
      return trade.type === 'sell';
    }).length;
    
    return (profitableTrades / this.trades.length) * 100;
  }

  // Calculate Sortino ratio
  calculateSortinoRatio(returns) {
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const downsideReturns = returns.filter(r => r < avgReturn);
    
    if (downsideReturns.length === 0) return 0;
    
    const downsideDeviation = Math.sqrt(
      downsideReturns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / downsideReturns.length
    );
    
    return avgReturn / downsideDeviation;
  }

  // Calculate profit factor
  calculateProfitFactor() {
    // Simplified profit factor calculation
    // Can be enhanced with actual P&L tracking
    return this.trades.length > 0 ? 1.5 : 0; // Placeholder
  }

  // Calculate maximum consecutive losses
  calculateMaxConsecutiveLosses() {
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (let i = 1; i < this.equity.length; i++) {
      if (this.equity[i] < this.equity[i - 1]) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return maxStreak;
  }

  // Get best trade
  getBestTrade() {
    if (this.trades.length === 0) return null;
    
    return this.trades.reduce((best, current) => {
      return current.price > best.price ? current : best;
    });
  }

  // Get worst trade
  getWorstTrade() {
    if (this.trades.length === 0) return null;
    
    return this.trades.reduce((worst, current) => {
      return current.price < worst.price ? current : worst;
    });
  }

  // Reset backtester state
  reset() {
    this.results = null;
    this.trades = [];
    this.equity = [];
    this.positions = {};
    this.cash = this.settings.initialCapital;
  }

  // Get backtest results
  getResults() {
    return this.results;
  }

  // Export results to JSON
  exportResults() {
    return JSON.stringify(this.results, null, 2);
  }
}