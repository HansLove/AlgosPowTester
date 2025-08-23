// Comprehensive reporting and analysis module
export class StrategyReporter {
  constructor(backtestResults, marketData) {
    this.results = backtestResults;
    this.marketData = marketData;
  }

  // Generate comprehensive strategy report
  generateReport() {
    if (!this.results) {
      return { error: 'No backtest results available' };
    }

    const report = {
      summary: this.generateSummary(),
      performance: this.generatePerformanceAnalysis(),
      risk: this.generateRiskAnalysis(),
      trading: this.generateTradingAnalysis(),
      market: this.generateMarketAnalysis(),
      recommendations: this.generateRecommendations(),
      charts: this.generateChartData(),
      timestamp: new Date().toISOString()
    };

    return report;
  }

  // Generate executive summary
  generateSummary() {
    const { summary, details } = this.results;
    
    return {
      title: 'Strategy Performance Summary',
      overview: {
        totalReturn: `${summary.totalReturn.toFixed(2)}%`,
        annualizedReturn: this.calculateAnnualizedReturn(summary.totalReturn),
        sharpeRatio: summary.sharpeRatio.toFixed(2),
        maxDrawdown: `${summary.maxDrawdown.toFixed(2)}%`,
        winRate: `${summary.winRate.toFixed(1)}%`,
        totalTrades: details.totalTrades
      },
      keyMetrics: {
        volatility: `${summary.volatility.toFixed(2)}%`,
        calmarRatio: summary.calmarRatio.toFixed(2),
        sortinoRatio: summary.sortinoRatio.toFixed(2),
        profitFactor: summary.profitFactor.toFixed(2)
      },
      capital: {
        initial: `$${details.initialCapital.toLocaleString()}`,
        final: `$${details.finalCapital.toLocaleString()}`,
        gain: `$${(details.finalCapital - details.initialCapital).toLocaleString()}`
      }
    };
  }

  // Generate performance analysis
  generatePerformanceAnalysis() {
    const { summary, equity } = this.results;
    
    // Calculate rolling returns
    const rollingReturns = this.calculateRollingReturns(equity, 30); // 30-day rolling
    
    // Calculate performance vs benchmarks
    const benchmarkComparison = this.compareToBenchmarks();
    
    return {
      returns: {
        total: summary.totalReturn,
        average: summary.avgReturn,
        bestMonth: Math.max(...rollingReturns),
        worstMonth: Math.min(...rollingReturns),
        positiveMonths: rollingReturns.filter(r => r > 0).length,
        negativeMonths: rollingReturns.filter(r => r < 0).length
      },
      rolling: {
        period: 30,
        returns: rollingReturns,
        average: rollingReturns.reduce((a, b) => a + b, 0) / rollingReturns.length
      },
      benchmarks: benchmarkComparison,
      consistency: this.calculateConsistencyScore()
    };
  }

  // Generate risk analysis
  generateRiskAnalysis() {
    const { summary, equity } = this.results;
    
    // Calculate Value at Risk (VaR)
    const var95 = this.calculateVaR(equity, 0.05);
    const var99 = this.calculateVaR(equity, 0.01);
    
    // Calculate Conditional VaR (Expected Shortfall)
    const cvar95 = this.calculateCVaR(equity, 0.05);
    
    // Calculate downside deviation
    const downsideDeviation = this.calculateDownsideDeviation(equity);
    
    return {
      drawdown: {
        maximum: summary.maxDrawdown,
        average: this.calculateAverageDrawdown(equity),
        duration: this.calculateMaxDrawdownDuration(equity),
        recovery: this.calculateRecoveryTime(equity)
      },
      riskMetrics: {
        volatility: summary.volatility,
        var95: var95,
        var99: var99,
        cvar95: cvar95,
        downsideDeviation: downsideDeviation
      },
      ratios: {
        sharpe: summary.sharpeRatio,
        sortino: summary.sortinoRatio,
        calmar: summary.calmarRatio,
        treynor: this.calculateTreynorRatio(summary.totalReturn, summary.volatility)
      }
    };
  }

  // Generate trading analysis
  generateTradingAnalysis() {
    const { trades, details } = this.results;
    
    if (trades.length === 0) {
      return { message: 'No trades executed' };
    }
    
    // Analyze trade patterns
    const tradeAnalysis = this.analyzeTradePatterns(trades);
    
    // Calculate trade statistics
    const tradeStats = this.calculateTradeStatistics(trades);
    
    return {
      execution: {
        totalTrades: details.totalTrades,
        profitableTrades: details.profitableTrades,
        lossMakingTrades: details.totalTrades - details.profitableTrades,
        averageTradeSize: this.calculateAverageTradeSize(trades),
        largestTrade: this.getLargestTrade(trades),
        smallestTrade: this.getSmallestTrade(trades)
      },
      patterns: tradeAnalysis,
      statistics: tradeStats,
      costs: {
        totalFees: details.totalFees,
        averageFee: details.totalFees / details.totalTrades,
        feeImpact: (details.totalFees / details.initialCapital) * 100
      }
    };
  }

  // Generate market analysis
  generateMarketAnalysis() {
    if (!this.marketData || !this.marketData.assets) {
      return { message: 'No market data available' };
    }
    
    const marketStats = this.marketData.getMarketStats();
    const correlationAnalysis = this.analyzeCorrelations();
    
    return {
      assets: marketStats,
      correlations: correlationAnalysis,
      volatility: this.calculateMarketVolatility(),
      trends: this.analyzeMarketTrends()
    };
  }

  // Generate recommendations
  generateRecommendations() {
    const { summary } = this.results;
    const recommendations = [];
    
    // Performance recommendations
    if (summary.sharpeRatio < 1.0) {
      recommendations.push({
        category: 'Performance',
        priority: 'High',
        message: 'Sharpe ratio below 1.0 suggests poor risk-adjusted returns. Consider optimizing strategy parameters or reducing volatility.',
        action: 'Review and optimize strategy parameters, consider adding stop-loss mechanisms'
      });
    }
    
    if (summary.maxDrawdown > 20) {
      recommendations.push({
        category: 'Risk Management',
        priority: 'High',
        message: 'Maximum drawdown exceeds 20%, indicating high risk. Implement better risk controls.',
        action: 'Add position sizing rules, implement stop-losses, consider hedging strategies'
      });
    }
    
    if (summary.winRate < 40) {
      recommendations.push({
        category: 'Trade Quality',
        priority: 'Medium',
        message: 'Win rate below 40% suggests poor trade selection. Review entry/exit criteria.',
        action: 'Analyze losing trades, refine entry/exit signals, consider filtering conditions'
      });
    }
    
    if (summary.volatility > 25) {
      recommendations.push({
        category: 'Risk',
        priority: 'Medium',
        message: 'High volatility may indicate excessive risk. Consider position sizing adjustments.',
        action: 'Reduce position sizes, implement volatility-based position sizing'
      });
    }
    
    // Positive recommendations
    if (summary.sharpeRatio > 1.5) {
      recommendations.push({
        category: 'Performance',
        priority: 'Low',
        message: 'Excellent risk-adjusted returns. Strategy shows strong performance.',
        action: 'Consider increasing position sizes gradually, monitor for consistency'
      });
    }
    
    if (summary.calmarRatio > 1.0) {
      recommendations.push({
        category: 'Risk-Reward',
        priority: 'Low',
        message: 'Good risk-reward profile with reasonable drawdowns.',
        action: 'Continue current approach, monitor for any degradation in performance'
      });
    }
    
    return recommendations;
  }

  // Generate chart data for visualization
  generateChartData() {
    const { equity, trades } = this.results;
    
    return {
      equity: {
        labels: this.marketData.timestamps.map(t => new Date(t).toLocaleDateString()),
        data: equity,
        title: 'Portfolio Equity Curve'
      },
      drawdown: {
        labels: this.marketData.timestamps.map(t => new Date(t).toLocaleDateString()),
        data: this.calculateDrawdownSeries(equity),
        title: 'Drawdown Analysis'
      },
      returns: {
        labels: this.marketData.timestamps.slice(1).map(t => new Date(t).toLocaleDateString()),
        data: this.calculateReturnSeries(equity),
        title: 'Daily Returns'
      },
      trades: this.generateTradeChartData(trades)
    };
  }

  // Helper methods
  calculateAnnualizedReturn(totalReturn) {
    const days = this.marketData.timestamps.length;
    const years = days / 365;
    return ((1 + totalReturn / 100) ** (1 / years) - 1) * 100;
  }

  calculateRollingReturns(equity, period) {
    const returns = [];
    for (let i = period; i < equity.length; i++) {
      const return_ = ((equity[i] - equity[i - period]) / equity[i - period]) * 100;
      returns.push(return_);
    }
    return returns;
  }

  compareToBenchmarks() {
    // Simplified benchmark comparison
    // In a real system, you'd compare against actual market indices
    return {
      sp500: { return: 10.5, correlation: 0.3 },
      nasdaq: { return: 15.2, correlation: 0.4 },
      bitcoin: { return: 45.8, correlation: 0.2 }
    };
  }

  calculateConsistencyScore() {
    const { equity } = this.results;
    const returns = this.calculateReturnSeries(equity);
    const positiveReturns = returns.filter(r => r > 0).length;
    return (positiveReturns / returns.length) * 100;
  }

  calculateVaR(equity, confidence) {
    const returns = this.calculateReturnSeries(equity);
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor(returns.length * confidence);
    return sortedReturns[index];
  }

  calculateCVaR(equity, confidence) {
    const returns = this.calculateReturnSeries(equity);
    const var_ = this.calculateVaR(equity, confidence);
    const tailReturns = returns.filter(r => r <= var_);
    return tailReturns.reduce((a, b) => a + b, 0) / tailReturns.length;
  }

  calculateDownsideDeviation(equity) {
    const returns = this.calculateReturnSeries(equity);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const downsideReturns = returns.filter(r => r < avgReturn);
    return Math.sqrt(downsideReturns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / downsideReturns.length);
  }

  calculateAverageDrawdown(equity) {
    const drawdowns = this.calculateDrawdownSeries(equity);
    return drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length;
  }

  calculateMaxDrawdownDuration(equity) {
    // Simplified calculation
    return Math.floor(equity.length * 0.1); // Placeholder
  }

  calculateRecoveryTime(equity) {
    // Simplified calculation
    return Math.floor(equity.length * 0.05); // Placeholder
  }

  calculateTreynorRatio(totalReturn, volatility) {
    const riskFreeRate = 2.0; // Assume 2% risk-free rate
    return (totalReturn - riskFreeRate) / volatility;
  }

  analyzeTradePatterns(trades) {
    const patterns = {
      byHour: {},
      byDay: {},
      byMonth: {}
    };
    
    trades.forEach(trade => {
      const date = new Date(trade.timestamp);
      
      // Hour pattern
      const hour = date.getHours();
      patterns.byHour[hour] = (patterns.byHour[hour] || 0) + 1;
      
      // Day pattern
      const day = date.getDay();
      patterns.byDay[day] = (patterns.byDay[day] || 0) + 1;
      
      // Month pattern
      const month = date.getMonth();
      patterns.byMonth[month] = (patterns.byMonth[month] || 0) + 1;
    });
    
    return patterns;
  }

  calculateTradeStatistics(trades) {
    const prices = trades.map(t => t.price);
    const costs = trades.map(t => t.cost);
    
    return {
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      priceVolatility: this.calculateStandardDeviation(prices),
      averageCost: costs.reduce((a, b) => a + b, 0) / costs.length,
      costEfficiency: trades.reduce((sum, t) => sum + t.price * t.quantity, 0) / costs.reduce((a, b) => a + b, 0)
    };
  }

  calculateAverageTradeSize(trades) {
    const totalVolume = trades.reduce((sum, t) => sum + t.quantity, 0);
    return totalVolume / trades.length;
  }

  getLargestTrade(trades) {
    return trades.reduce((largest, current) => 
      current.quantity > largest.quantity ? current : largest
    );
  }

  getSmallestTrade(trades) {
    return trades.reduce((smallest, current) => 
      current.quantity < smallest.quantity ? current : smallest
    );
  }

  analyzeCorrelations() {
    if (!this.marketData.assets) return {};
    
    const assets = Object.keys(this.marketData.assets);
    const correlations = {};
    
    assets.forEach(asset1 => {
      correlations[asset1] = {};
      assets.forEach(asset2 => {
        if (asset1 === asset2) {
          correlations[asset1][asset2] = 1;
        } else {
          correlations[asset1][asset2] = this.calculateCorrelation(
            this.marketData.assets[asset1].returns,
            this.marketData.assets[asset2].returns
          );
        }
      });
    });
    
    return correlations;
  }

  calculateCorrelation(returns1, returns2) {
    const n = Math.min(returns1.length, returns2.length);
    if (n === 0) return 0;
    
    const mean1 = returns1.reduce((a, b) => a + b, 0) / n;
    const mean2 = returns2.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0, denominator1 = 0, denominator2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }
    
    return numerator / Math.sqrt(denominator1 * denominator2);
  }

  calculateMarketVolatility() {
    if (!this.marketData.assets) return {};
    
    const volatility = {};
    Object.keys(this.marketData.assets).forEach(assetKey => {
      const asset = this.marketData.assets[assetKey];
      const returns = asset.returns.slice(1);
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
      volatility[assetKey] = Math.sqrt(variance) * 100;
    });
    
    return volatility;
  }

  analyzeMarketTrends() {
    if (!this.marketData.assets) return {};
    
    const trends = {};
    Object.keys(this.marketData.assets).forEach(assetKey => {
      const asset = this.marketData.assets[assetKey];
      const prices = asset.prices;
      const startPrice = prices[0];
      const endPrice = prices[prices.length - 1];
      
      trends[assetKey] = {
        direction: endPrice > startPrice ? 'bullish' : 'bearish',
        strength: Math.abs((endPrice - startPrice) / startPrice) * 100,
        trend: endPrice > startPrice ? 'uptrend' : 'downtrend'
      };
    });
    
    return trends;
  }

  calculateDrawdownSeries(equity) {
    const drawdowns = [];
    let peak = equity[0];
    
    for (let i = 0; i < equity.length; i++) {
      if (equity[i] > peak) {
        peak = equity[i];
      }
      drawdowns.push(((peak - equity[i]) / peak) * 100);
    }
    
    return drawdowns;
  }

  calculateReturnSeries(equity) {
    const returns = [];
    for (let i = 1; i < equity.length; i++) {
      if (equity[i - 1] > 0) {
        returns.push(((equity[i] - equity[i - 1]) / equity[i - 1]) * 100);
      } else {
        returns.push(0);
      }
    }
    return returns;
  }

  generateTradeChartData(trades) {
    if (trades.length === 0) return null;
    
    const tradeData = trades.map((trade, index) => ({
      x: index,
      y: trade.price,
      type: trade.type,
      size: trade.quantity,
      timestamp: trade.timestamp
    }));
    
    return {
      data: tradeData,
      title: 'Trade Execution Points'
    };
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Export report to different formats
  exportToJSON() {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  exportToCSV() {
    const report = this.generateReport();
    // Convert to CSV format (simplified)
    return this.convertToCSV(report);
  }

  convertToCSV(data) {
    // Simplified CSV conversion
    const lines = [];
    
    // Add headers
    lines.push('Metric,Value');
    
    // Add summary data
    Object.entries(data.summary.overview).forEach(([key, value]) => {
      lines.push(`${key},${value}`);
    });
    
    return lines.join('\n');
  }
}
