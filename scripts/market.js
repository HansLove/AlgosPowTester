import { ASSETS } from './config.js';

// Market data generation and management
export class MarketGenerator {
  constructor() {
    this.data = {};
    this.datasetHash = null;
  }

  // Generate correlated price series for multiple assets
  generateMultiAssetMarket(assets, settings) {
    const { candles, seed, correlationMatrix } = settings;
    const prng = this.mulberry32(this.seedToInt(seed));
    
    // Initialize data structure
    this.data = {
      assets: {},
      timestamps: [],
      correlationMatrix: correlationMatrix || this.generateCorrelationMatrix(assets)
    };

    // Generate individual asset series
    assets.forEach(assetKey => {
      const asset = ASSETS[assetKey];
      if (!asset) return;

      const series = this.generateAssetSeries(
        candles, 
        seed + '-' + assetKey, 
        asset.defaultPrice, 
        asset.defaultDrift, 
        asset.defaultVolatility
      );
      
      this.data.assets[assetKey] = {
        ...asset,
        prices: series,
        returns: this.calculateReturns(series)
      };
    });

    // Apply correlation adjustments
    this.applyCorrelations();
    
    // Generate timestamps
    this.data.timestamps = this.generateTimestamps(candles);
    
    return this.data;
  }

  // Generate individual asset price series using Geometric Brownian Motion
  generateAssetSeries(n, seed, s0, mu, sigma) {
    const prng = this.mulberry32(this.seedToInt(seed));
    const arr = new Array(n);
    let s = s0;
    
    for (let i = 0; i < n; i++) {
      const z = this.randNorm(prng);
      s = s * Math.exp(mu + sigma * z);
      arr[i] = Math.max(s, 0.01); // Prevent negative prices
    }
    
    return arr;
  }

  // Generate correlation matrix for assets
  generateCorrelationMatrix(assets) {
    const matrix = {};
    assets.forEach(asset1 => {
      matrix[asset1] = {};
      assets.forEach(asset2 => {
        if (asset1 === asset2) {
          matrix[asset1][asset2] = 1;
        } else {
          // Generate realistic correlations based on asset types
          matrix[asset1][asset2] = this.getRealisticCorrelation(asset1, asset2);
        }
      });
    });
    return matrix;
  }

  // Get realistic correlation between asset types
  getRealisticCorrelation(asset1, asset2) {
    const correlations = {
      // Crypto assets
      'bitcoin-ethereum': 0.7,
      'bitcoin-gold': 0.1,
      'bitcoin-sp500': 0.3,
      'bitcoin-nasdaq': 0.4,
      'bitcoin-usd': -0.2,
      
      // Traditional assets
      'gold-sp500': -0.1,
      'gold-nasdaq': -0.15,
      'gold-usd': -0.3,
      'sp500-nasdaq': 0.9,
      'sp500-usd': -0.2,
      'nasdaq-usd': -0.25
    };

    const key = [asset1, asset2].sort().join('-');
    return correlations[key] || 0.1; // Default low correlation
  }

  // Apply correlation adjustments to asset returns
  applyCorrelations() {
    const assetKeys = Object.keys(this.data.assets);
    if (assetKeys.length < 2) return;

    // Cholesky decomposition for correlation matrix
    const L = this.choleskyDecomposition(this.data.correlationMatrix, assetKeys);
    
    // Apply correlation transformation
    assetKeys.forEach((assetKey, i) => {
      const asset = this.data.assets[assetKey];
      const correlatedReturns = new Array(asset.returns.length);
      
      for (let t = 0; t < asset.returns.length; t++) {
        let correlated = 0;
        for (let j = 0; j <= i; j++) {
          correlated += L[i][j] * this.data.assets[assetKeys[j]].returns[t];
        }
        correlatedReturns[t] = correlated;
      }
      
      // Reconstruct prices from correlated returns
      const newPrices = [asset.prices[0]];
      for (let t = 1; t < asset.prices.length; t++) {
        newPrices[t] = newPrices[t-1] * Math.exp(correlatedReturns[t]);
      }
      
      asset.prices = newPrices;
      asset.returns = correlatedReturns;
    });
  }

  // Cholesky decomposition for correlation matrix
  choleskyDecomposition(correlationMatrix, assetKeys) {
    const n = assetKeys.length;
    const L = Array(n).fill().map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;
        
        if (j === i) {
          for (let k = 0; k < j; k++) {
            sum += L[j][k] * L[j][k];
          }
          L[j][j] = Math.sqrt(correlationMatrix[assetKeys[i]][assetKeys[j]] - sum);
        } else {
          for (let k = 0; k < j; k++) {
            sum += L[i][k] * L[j][k];
          }
          L[i][j] = (correlationMatrix[assetKeys[i]][assetKeys[j]] - sum) / L[j][j];
        }
      }
    }
    
    return L;
  }

  // Calculate returns from price series
  calculateReturns(prices) {
    const returns = new Array(prices.length).fill(0);
    for (let i = 1; i < prices.length; i++) {
      returns[i] = Math.log(prices[i] / prices[i-1]);
    }
    return returns;
  }

  // Generate timestamps for the data
  generateTimestamps(candles) {
    const timestamps = [];
    const now = Date.now();
    const interval = 24 * 60 * 60 * 1000; // Daily intervals
    
    for (let i = 0; i < candles; i++) {
      timestamps.push(now - (candles - i - 1) * interval);
    }
    
    return timestamps;
  }

  // Get market statistics
  getMarketStats() {
    const stats = {};
    
    Object.keys(this.data.assets).forEach(assetKey => {
      const asset = this.data.assets[assetKey];
      const prices = asset.prices;
      const returns = asset.returns.slice(1); // Skip first return (always 0)
      
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const volatility = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length);
      const sharpeRatio = avgReturn / volatility;
      
      stats[assetKey] = {
        name: asset.name,
        symbol: asset.symbol,
        startPrice: prices[0],
        endPrice: prices[prices.length - 1],
        totalReturn: (prices[prices.length - 1] / prices[0] - 1) * 100,
        avgReturn: avgReturn * 100,
        volatility: volatility * 100,
        sharpeRatio: sharpeRatio,
        maxDrawdown: this.calculateMaxDrawdown(prices),
        color: asset.color
      };
    });
    
    return stats;
  }

  // Calculate maximum drawdown
  calculateMaxDrawdown(prices) {
    let peak = prices[0];
    let maxDrawdown = 0;
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > peak) {
        peak = prices[i];
      } else {
        const drawdown = (peak - prices[i]) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown * 100;
  }

  // Utility functions
  mulberry32(a) {
    return function() {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  seedToInt(seed) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  randNorm(prng) {
    let u = 0, v = 0;
    while (u === 0) u = prng();
    while (v === 0) v = prng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}