// 🌀 Chaos Engine - Mass Strategy Testing with Proof of Work
import { Backtester } from './backtester.js';
import { MarketGenerator } from './market.js';
import { TechnicalIndicators } from './indicators.js';

export class ChaosEngine {
  constructor() {
    this.isRunning = false;
    this.currentTest = 0;
    this.totalTests = 0;
    this.startTime = null;
    this.results = [];
    this.proofOfWork = null;
    this.qualityMetrics = {};
    
    // Performance tracking
    this.performanceMetrics = {
      testsPerSecond: 0,
      estimatedTimeRemaining: 0,
      memoryUsage: 0
    };
  }

  // Initialize proof of work system
  async initializeProofOfWork(difficulty = 1) {
    this.proofOfWork = {
      difficulty,
      nonce: 0,
      target: Math.pow(2, 256 - difficulty),
      hash: null
    };
    
    // Generate initial hash
    this.proofOfWork.hash = await this.generateHash('chaos-engine-init');
    console.log('🔐 Proof of Work initialized with difficulty:', difficulty);
  }

  // Generate SHA-256 hash (simplified implementation)
  async generateHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data + this.proofOfWork.nonce);
    
    // Use Web Crypto API for actual hashing
    if (window.crypto && window.crypto.subtle) {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback simple hash for compatibility
    let hash = 0;
    for (let i = 0; i < dataBuffer.length; i++) {
      const char = dataBuffer[i];
      hash = ((hash << 5) - hash + char) & 0xffffffff;
    }
    return hash.toString(16);
  }

  // Mine proof of work
  async mineProofOfWork() {
    if (!this.proofOfWork) return false;
    
    let attempts = 0;
    const maxAttempts = 10000; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      this.proofOfWork.nonce++;
      const hash = await this.generateHash('chaos-test-' + this.currentTest);
      
      // Check if hash meets difficulty requirement
      const hashValue = parseInt(hash.substring(0, 8), 16);
      if (hashValue < this.proofOfWork.target) {
        this.proofOfWork.hash = hash;
        return true;
      }
      
      attempts++;
      
      // Allow UI updates every 1000 attempts
      if (attempts % 1000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    return false;
  }

  // Launch mass testing with proof of work
  async launchMassTesting(config) {
    if (this.isRunning) {
      throw new Error('Chaos Engine is already running');
    }

    const {
      iterations,
      scenario,
      stressLevel,
      strategyConfig,
      marketSettings,
      proofOfWorkDifficulty = 1
    } = config;

    this.totalTests = Math.floor(iterations * 1000000); // Convert to actual number
    this.currentTest = 0;
    this.results = [];
    this.isRunning = true;
    this.startTime = Date.now();

    console.log(`🚀 Launching Chaos Engine: ${this.totalTests.toLocaleString()} tests`);
    console.log(`🔐 Proof of Work Difficulty: ${proofOfWorkDifficulty}`);

    // Initialize proof of work
    await this.initializeProofOfWork(proofOfWorkDifficulty);

    // Initialize quality metrics
    this.initializeQualityMetrics();

    try {
      // Run tests in batches for performance
      const batchSize = this.calculateOptimalBatchSize();
      const results = await this.runTestBatches(batchSize, scenario, stressLevel, strategyConfig, marketSettings);
      
      // Calculate final quality assessment
      const qualityReport = this.generateQualityReport(results);
      
      return {
        results,
        qualityReport,
        performanceMetrics: this.performanceMetrics,
        proofOfWork: this.proofOfWork
      };
      
    } finally {
      this.isRunning = false;
    }
  }

  // Calculate optimal batch size based on system performance
  calculateOptimalBatchSize() {
    // Adaptive batch sizing based on available memory and performance
    const memoryLimit = 100 * 1024 * 1024; // 100MB limit
    const estimatedMemoryPerTest = 1024; // 1KB per test estimate
    
    let batchSize = Math.min(1000, Math.floor(memoryLimit / estimatedMemoryPerTest));
    
    // Ensure batch size is reasonable
    batchSize = Math.max(100, Math.min(batchSize, 5000));
    
    return batchSize;
  }

  // Run tests in batches
  async runTestBatches(batchSize, scenario, stressLevel, strategyConfig, marketSettings) {
    const results = {
      totalTests: this.totalTests,
      tests: [],
      scenarioResults: {},
      summary: {
        successRate: 0,
        avgReturn: 0,
        avgDrawdown: 0,
        avgSharpe: 0,
        survivalRate: 0,
        bestReturn: -Infinity,
        worstReturn: Infinity,
        bestSharpe: -Infinity,
        worstDrawdown: 0,
        consistencyScore: 0,
        robustnessScore: 0
      }
    };

    // Initialize scenario tracking
    const scenarios = ['normal', 'volatile', 'crisis', 'bubble', 'trending', 'sideways', 'mixed'];
    scenarios.forEach(s => {
      results.scenarioResults[s] = { count: 0, returns: [], drawdowns: [], sharpes: [] };
    });

    const marketGenerator = new MarketGenerator();
    let completedTests = 0;

    for (let batch = 0; batch < this.totalTests; batch += batchSize) {
      const currentBatchSize = Math.min(batchSize, this.totalTests - batch);
      
      // Process batch
      for (let i = 0; i < currentBatchSize; i++) {
        // Mine proof of work for this test
        const proofOfWorkValid = await this.mineProofOfWork();
        if (!proofOfWorkValid) {
          console.warn('Proof of work validation failed for test:', this.currentTest);
        }

        // Run single test
        const testResult = await this.runSingleTest(
          scenario, 
          stressLevel, 
          strategyConfig, 
          marketSettings,
          marketGenerator,
          proofOfWorkValid
        );

        // Add proof of work info to result
        testResult.proofOfWork = {
          hash: this.proofOfWork.hash,
          nonce: this.proofOfWork.nonce,
          difficulty: this.proofOfWork.difficulty,
          valid: proofOfWorkValid
        };

        results.tests.push(testResult);
        
        // Track scenario performance
        const testScenario = testResult.scenario;
        if (results.scenarioResults[testScenario]) {
          results.scenarioResults[testScenario].count++;
          results.scenarioResults[testScenario].returns.push(testResult.totalReturn);
          results.scenarioResults[testScenario].drawdowns.push(testResult.maxDrawdown);
          results.scenarioResults[testScenario].sharpes.push(testResult.sharpeRatio);
        }
        
        completedTests++;
        this.currentTest = completedTests;
        
        // Update performance metrics
        this.updatePerformanceMetrics(completedTests);
        
        // Update progress every 100 tests
        if (completedTests % 100 === 0) {
          // Emit progress event
          this.emitProgress(completedTests, this.totalTests);
          
          // Allow UI to update
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    }

    // Calculate final summary and quality metrics
    this.calculateFinalSummary(results);
    this.calculateQualityMetrics(results);

    return results;
  }

  // Run single test with proof of work
  async runSingleTest(scenario, stressLevel, strategyConfig, marketSettings, marketGenerator, proofOfWorkValid) {
    // Generate chaotic market data
    const chaoticMarket = this.generateChaoticMarket(scenario, stressLevel, marketSettings, marketGenerator);
    
    // Create backtester instance
    const backtester = new Backtester(chaoticMarket, {
      fee: marketSettings.fee || 0.001,
      initialCapital: marketSettings.initialCapital || 10000
    });
    
    // Run backtest
    const backtestResults = await backtester.runBacktest(strategyConfig);
    
    // Add scenario and proof of work information
    const testResult = {
      ...backtestResults,
      scenario,
      stressLevel,
      proofOfWorkValid,
      timestamp: Date.now(),
      testId: this.currentTest
    };
    
    return testResult;
  }

  // Generate chaotic market with realistic patterns
  generateChaoticMarket(scenario, stressLevel, marketSettings, marketGenerator) {
    const candles = marketSettings.candles || 1000;
    const baseVolatility = this.getBaseVolatility(stressLevel);
    const scenarioMultiplier = this.getScenarioMultiplier(scenario);
    
    // Generate market data with chaos engine patterns
    const market = marketGenerator.generateMultiAssetMarket(
      marketSettings.selectedAssets || ['bitcoin'],
      {
        candles,
        seed: `chaos-${scenario}-${stressLevel}-${Date.now()}`,
        volatility: baseVolatility * scenarioMultiplier,
        scenario,
        stressLevel
      }
    );
    
    // Apply scenario-specific modifications
    this.applyScenarioModifications(market, scenario, stressLevel);
    
    return market;
  }

  // Apply scenario-specific modifications to market data
  applyScenarioModifications(market, scenario, stressLevel) {
    Object.keys(market.assets).forEach(assetKey => {
      const asset = market.assets[assetKey];
      const prices = asset.prices;
      
      // Apply scenario-specific patterns
      switch (scenario) {
        case 'crisis':
          this.applyCrisisPattern(prices, stressLevel);
          break;
        case 'bubble':
          this.applyBubblePattern(prices, stressLevel);
          break;
        case 'trending':
          this.applyTrendingPattern(prices, stressLevel);
          break;
        case 'sideways':
          this.applySidewaysPattern(prices, stressLevel);
          break;
        case 'volatile':
          this.applyVolatilePattern(prices, stressLevel);
          break;
      }
    });
  }

  // Apply crisis pattern (high volatility, crashes, recovery)
  applyCrisisPattern(prices, stressLevel) {
    const crashPoints = [0.3, 0.6, 0.8]; // Crisis points in the timeline
    
    crashPoints.forEach(point => {
      const index = Math.floor(prices.length * point);
      if (index < prices.length) {
        // Apply crash
        const crashSeverity = 0.1 + (stressLevel === 'extreme' ? 0.3 : 0.1);
        prices[index] *= (1 - crashSeverity);
        
        // Apply recovery pattern
        for (let i = index + 1; i < Math.min(index + 50, prices.length); i++) {
          const recoveryFactor = 1 + (Math.random() * 0.02 - 0.01);
          prices[i] = prices[i - 1] * recoveryFactor;
        }
      }
    });
  }

  // Apply bubble pattern (exponential growth, burst)
  applyBubblePattern(prices, stressLevel) {
    const bubbleStart = Math.floor(prices.length * 0.2);
    const bubblePeak = Math.floor(prices.length * 0.7);
    const bubbleBurst = Math.floor(prices.length * 0.8);
    
    // Bubble growth phase
    for (let i = bubbleStart; i < bubblePeak; i++) {
      const growthFactor = 1 + (0.01 + (i - bubbleStart) * 0.001);
      prices[i] = prices[i - 1] * growthFactor;
    }
    
    // Bubble burst
    if (bubbleBurst < prices.length) {
      const burstSeverity = 0.3 + (stressLevel === 'extreme' ? 0.4 : 0.2);
      prices[bubbleBurst] *= (1 - burstSeverity);
    }
  }

  // Apply trending pattern (consistent directional movement)
  applyTrendingPattern(prices, stressLevel) {
    const trendDirection = Math.random() > 0.5 ? 1 : -1;
    const trendStrength = 0.001 + (stressLevel === 'extreme' ? 0.003 : 0.001);
    
    for (let i = 1; i < prices.length; i++) {
      const trendComponent = trendDirection * trendStrength;
      const randomComponent = (Math.random() - 0.5) * 0.005;
      prices[i] = prices[i - 1] * (1 + trendComponent + randomComponent);
    }
  }

  // Apply sideways pattern (mean reversion)
  applySidewaysPattern(prices, stressLevel) {
    const meanPrice = prices[0];
    const reversionStrength = 0.001 + (stressLevel === 'extreme' ? 0.002 : 0.001);
    
    for (let i = 1; i < prices.length; i++) {
      const deviation = (meanPrice - prices[i - 1]) / meanPrice;
      const reversionComponent = deviation * reversionStrength;
      const randomComponent = (Math.random() - 0.5) * 0.003;
      prices[i] = prices[i - 1] * (1 + reversionComponent + randomComponent);
    }
  }

  // Apply volatile pattern (high volatility periods)
  applyVolatilePattern(prices, stressLevel) {
    const volatilitySpikes = [0.2, 0.4, 0.6, 0.8];
    
    volatilitySpikes.forEach(point => {
      const index = Math.floor(prices.length * point);
      const spikeLength = 20 + Math.floor(Math.random() * 30);
      
      for (let i = index; i < Math.min(index + spikeLength, prices.length); i++) {
        const volatility = 0.02 + (stressLevel === 'extreme' ? 0.05 : 0.02);
        const change = (Math.random() - 0.5) * volatility;
        prices[i] = prices[i - 1] * (1 + change);
      }
    });
  }

  // Get base volatility based on stress level
  getBaseVolatility(stressLevel) {
    const volatilityMap = {
      'low': 0.01,
      'medium': 0.02,
      'high': 0.04,
      'extreme': 0.08
    };
    return volatilityMap[stressLevel] || 0.02;
  }

  // Get scenario multiplier
  getScenarioMultiplier(scenario) {
    const multiplierMap = {
      'normal': 1.0,
      'volatile': 1.5,
      'crisis': 2.5,
      'bubble': 2.0,
      'trending': 1.2,
      'sideways': 0.8,
      'mixed': 1.3
    };
    return multiplierMap[scenario] || 1.0;
  }

  // Update performance metrics
  updatePerformanceMetrics(completedTests) {
    const elapsedTime = (Date.now() - this.startTime) / 1000; // seconds
    this.performanceMetrics.testsPerSecond = completedTests / elapsedTime;
    
    if (this.performanceMetrics.testsPerSecond > 0) {
      const remainingTests = this.totalTests - completedTests;
      this.performanceMetrics.estimatedTimeRemaining = remainingTests / this.performanceMetrics.testsPerSecond;
    }
    
    // Estimate memory usage
    this.performanceMetrics.memoryUsage = this.estimateMemoryUsage();
  }

  // Estimate memory usage
  estimateMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }

  // Emit progress event
  emitProgress(current, total) {
    const event = new CustomEvent('chaosProgress', {
      detail: {
        current,
        total,
        percentage: (current / total) * 100,
        performanceMetrics: this.performanceMetrics,
        proofOfWork: this.proofOfWork
      }
    });
    window.dispatchEvent(event);
  }

  // Calculate final summary
  calculateFinalSummary(results) {
    const tests = results.tests;
    if (tests.length === 0) return;
    
    // Calculate basic metrics
    const returns = tests.map(t => t.summary?.totalReturn || 0);
    const drawdowns = tests.map(t => t.summary?.maxDrawdown || 0);
    const sharpes = tests.map(t => t.summary?.sharpeRatio || 0);
    
    results.summary.avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    results.summary.avgDrawdown = drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length;
    results.summary.avgSharpe = sharpes.reduce((a, b) => a + b, 0) / sharpes.length;
    
    results.summary.bestReturn = Math.max(...returns);
    results.summary.worstReturn = Math.min(...returns);
    results.summary.bestSharpe = Math.max(...sharpes);
    results.summary.worstDrawdown = Math.max(...drawdowns);
    
    // Calculate success rate (profitable tests)
    const profitableTests = tests.filter(t => (t.summary?.totalReturn || 0) > 0).length;
    results.summary.successRate = (profitableTests / tests.length) * 100;
    
    // Calculate survival rate (tests with drawdown < 50%)
    const survivingTests = tests.filter(t => (t.summary?.maxDrawdown || 0) < 50).length;
    results.summary.survivalRate = (survivingTests / tests.length) * 100;
  }

  // Initialize quality metrics
  initializeQualityMetrics() {
    this.qualityMetrics = {
      consistency: 0,
      robustness: 0,
      adaptability: 0,
      riskManagement: 0,
      overallScore: 0
    };
  }

  // Calculate quality metrics
  calculateQualityMetrics(results) {
    const tests = results.tests;
    if (tests.length === 0) return;
    
    // Consistency: How stable are the returns?
    const returns = tests.map(t => t.summary?.totalReturn || 0);
    const returnStdDev = this.calculateStandardDeviation(returns);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    this.qualityMetrics.consistency = Math.max(0, 100 - (returnStdDev / Math.abs(avgReturn)) * 100);
    
    // Robustness: How well does it perform across scenarios?
    const scenarioPerformance = Object.values(results.scenarioResults)
      .filter(data => data.count > 0)
      .map(data => {
        const avgReturn = data.returns.reduce((a, b) => a + b, 0) / data.returns.length;
        return avgReturn;
      });
    
    const scenarioStdDev = this.calculateStandardDeviation(scenarioPerformance);
    this.qualityMetrics.robustness = Math.max(0, 100 - (scenarioStdDev / 10) * 100);
    
    // Adaptability: How well does it handle different stress levels?
    const stressLevels = ['low', 'medium', 'high', 'extreme'];
    const stressPerformance = stressLevels.map(level => {
      const levelTests = tests.filter(t => t.stressLevel === level);
      if (levelTests.length === 0) return 0;
      const avgReturn = levelTests.reduce((sum, t) => sum + (t.summary?.totalReturn || 0), 0) / levelTests.length;
      return avgReturn;
    });
    
    const stressStdDev = this.calculateStandardDeviation(stressPerformance);
    this.qualityMetrics.adaptability = Math.max(0, 100 - (stressStdDev / 10) * 100);
    
    // Risk Management: How well does it control drawdowns?
    const avgDrawdown = results.summary.avgDrawdown;
    this.qualityMetrics.riskManagement = Math.max(0, 100 - (avgDrawdown / 2) * 100);
    
    // Overall Score: Weighted average of all metrics
    this.qualityMetrics.overallScore = (
      this.qualityMetrics.consistency * 0.25 +
      this.qualityMetrics.robustness * 0.25 +
      this.qualityMetrics.adaptability * 0.2 +
      this.qualityMetrics.riskManagement * 0.3
    );
  }

  // Calculate standard deviation
  calculateStandardDeviation(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Generate comprehensive quality report
  generateQualityReport(results) {
    const report = {
      summary: {
        totalTests: results.totalTests,
        executionTime: this.startTime ? (Date.now() - this.startTime) / 1000 : 0,
        proofOfWorkValid: results.tests.filter(t => t.proofOfWork?.valid).length,
        proofOfWorkInvalid: results.tests.filter(t => !t.proofOfWork?.valid).length
      },
      qualityMetrics: this.qualityMetrics,
      performanceMetrics: this.performanceMetrics,
      scenarioAnalysis: this.analyzeScenarios(results),
      recommendations: this.generateRecommendations(results),
      riskAssessment: this.assessRisk(results),
      proofOfWorkReport: this.generateProofOfWorkReport(results)
    };
    
    return report;
  }

  // Analyze performance across scenarios
  analyzeScenarios(results) {
    const analysis = {};
    
    Object.entries(results.scenarioResults).forEach(([scenario, data]) => {
      if (data.count === 0) return;
      
      const returns = data.returns;
      const drawdowns = data.drawdowns;
      const sharpes = data.sharpes;
      
      analysis[scenario] = {
        testCount: data.count,
        avgReturn: returns.reduce((a, b) => a + b, 0) / returns.length,
        avgDrawdown: drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length,
        avgSharpe: sharpes.reduce((a, b) => a + b, 0) / sharpes.length,
        successRate: (returns.filter(r => r > 0).length / returns.length) * 100,
        consistency: this.calculateStandardDeviation(returns)
      };
    });
    
    return analysis;
  }

  // Generate recommendations based on results
  generateRecommendations(results) {
    const recommendations = [];
    
    // Success rate analysis
    if (results.summary.successRate < 40) {
      recommendations.push({
        category: 'Strategy Performance',
        priority: 'high',
        message: 'Strategy shows poor performance across market scenarios. Consider fundamental changes to the approach.',
        action: 'Review strategy logic and risk management rules',
        impact: 'Critical'
      });
    } else if (results.summary.successRate < 60) {
      recommendations.push({
        category: 'Strategy Performance',
        priority: 'medium',
        message: 'Strategy performance is below average. Some optimization may be needed.',
        action: 'Fine-tune parameters and test additional scenarios',
        impact: 'Moderate'
      });
    }
    
    // Drawdown analysis
    if (results.summary.avgDrawdown > 30) {
      recommendations.push({
        category: 'Risk Management',
        priority: 'high',
        message: 'Strategy shows excessive drawdowns. Risk management needs improvement.',
        action: 'Implement stop-losses and position sizing rules',
        impact: 'High'
      });
    }
    
    // Quality metrics analysis
    if (this.qualityMetrics.consistency < 50) {
      recommendations.push({
        category: 'Strategy Consistency',
        priority: 'medium',
        message: 'Strategy shows inconsistent performance. Consider smoothing mechanisms.',
        action: 'Add filters and confirmation signals',
        impact: 'Moderate'
      });
    }
    
    if (this.qualityMetrics.robustness < 60) {
      recommendations.push({
        category: 'Market Adaptability',
        priority: 'medium',
        message: 'Strategy struggles in certain market conditions.',
        action: 'Develop scenario-specific adaptations',
        impact: 'Moderate'
      });
    }
    
    // Overall assessment
    if (this.qualityMetrics.overallScore > 80) {
      recommendations.push({
        category: 'Strategy Assessment',
        priority: 'low',
        message: 'Strategy shows robust performance across various market conditions.',
        action: 'Continue monitoring and consider live trading with proper risk management',
        impact: 'Low'
      });
    }
    
    return recommendations;
  }

  // Assess overall risk
  assessRisk(results) {
    const riskFactors = [];
    let overallRisk = 'low';
    
    // Success rate risk
    if (results.summary.successRate < 50) {
      riskFactors.push('Low success rate indicates high risk of losses');
      overallRisk = 'high';
    }
    
    // Drawdown risk
    if (results.summary.avgDrawdown > 25) {
      riskFactors.push('High average drawdown indicates significant capital risk');
      overallRisk = overallRisk === 'low' ? 'medium' : 'high';
    }
    
    // Consistency risk
    if (this.qualityMetrics.consistency < 60) {
      riskFactors.push('Low consistency indicates unpredictable performance');
      overallRisk = overallRisk === 'low' ? 'medium' : overallRisk;
    }
    
    // Scenario risk
    const worstScenario = Object.entries(results.scenarioResults)
      .filter(([_, data]) => data.count > 0)
      .sort(([_, a], [__, b]) => {
        const aAvg = a.returns.reduce((sum, r) => sum + r, 0) / a.returns.length;
        const bAvg = b.returns.reduce((sum, r) => sum + r, 0) / b.returns.length;
        return aAvg - bAvg;
      })[0];
    
    if (worstScenario) {
      const [scenario, data] = worstScenario;
      const avgReturn = data.returns.reduce((a, b) => a + b, 0) / data.returns.length;
      
      if (avgReturn < -15) {
        riskFactors.push(`Strategy struggles in ${scenario} markets (avg return: ${avgReturn.toFixed(2)}%)`);
        overallRisk = overallRisk === 'low' ? 'medium' : overallRisk;
      }
    }
    
    return {
      level: overallRisk,
      factors: riskFactors,
      score: this.calculateRiskScore(results)
    };
  }

  // Calculate risk score (0-100, higher = more risky)
  calculateRiskScore(results) {
    let score = 0;
    
    // Success rate contribution (40% weight)
    score += (100 - results.summary.successRate) * 0.4;
    
    // Drawdown contribution (30% weight)
    score += Math.min(results.summary.avgDrawdown * 2, 100) * 0.3;
    
    // Consistency contribution (20% weight)
    score += (100 - this.qualityMetrics.consistency) * 0.2;
    
    // Robustness contribution (10% weight)
    score += (100 - this.qualityMetrics.robustness) * 0.1;
    
    return Math.min(100, Math.max(0, score));
  }

  // Generate proof of work report
  generateProofOfWorkReport(results) {
    const validTests = results.tests.filter(t => t.proofOfWork?.valid);
    const invalidTests = results.tests.filter(t => !t.proofOfWork?.valid);
    
    return {
      totalTests: results.totalTests,
      validProofs: validTests.length,
      invalidProofs: invalidTests.length,
      validationRate: (validTests.length / results.totalTests) * 100,
      averageNonce: validTests.reduce((sum, t) => sum + (t.proofOfWork?.nonce || 0), 0) / validTests.length,
      difficulty: this.proofOfWork?.difficulty || 0,
      finalHash: this.proofOfWork?.hash || 'unknown'
    };
  }

  // Stop the chaos engine
  stop() {
    this.isRunning = false;
    console.log('🛑 Chaos Engine stopped');
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentTest: this.currentTest,
      totalTests: this.totalTests,
      progress: this.totalTests > 0 ? (this.currentTest / this.totalTests) * 100 : 0,
      performanceMetrics: this.performanceMetrics,
      proofOfWork: this.proofOfWork
    };
  }

  // Export results to JSON
  exportResults(results) {
    return JSON.stringify({
      results,
      qualityReport: this.generateQualityReport(results),
      performanceMetrics: this.performanceMetrics,
      proofOfWork: this.proofOfWork,
      exportTimestamp: new Date().toISOString()
    }, null, 2);
  }
}
