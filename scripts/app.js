// Main application controller
import { MarketGenerator } from './market.js';
import { Backtester } from './backtester.js';
import { StrategyReporter } from './reporting.js';
import { ASSETS, DEFAULT_SETTINGS, STRATEGY_TEMPLATES } from './config.js';
import { $, fmt, storage, dom, string } from './utils.js';

export class TradingApp {
  constructor() {
    this.marketGenerator = new MarketGenerator();
    this.backtester = null;
    this.reporter = null;
    this.currentMarketData = null;
    this.currentResults = null;
    
    this.state = {
      selectedAssets: ['bitcoin'],
      settings: { ...DEFAULT_SETTINGS },
      strategy: {
        type: 'ma',
        params: { ...STRATEGY_TEMPLATES.ma.params },
        customCode: ''
      }
    };
    
    this.init();
  }

  // Initialize the application
  init() {
    console.log('Initializing TradingApp...');
    console.log('Available assets:', ASSETS);
    console.log('Strategy templates:', STRATEGY_TEMPLATES);
    
    this.loadState();
    console.log('State loaded:', this.state);
    
    this.setupEventListeners();
    console.log('Event listeners setup complete');
    
    this.renderAssetSelector();
    console.log('Asset selector rendered');
    
    this.renderStrategySelector();
    console.log('Strategy selector rendered');
    
    this.generateInitialMarket();
    console.log('Initial market generation started');
  }

  // Setup event listeners
  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Asset selection
    const btnAddAsset = $('#btnAddAsset');
    const btnRemoveAsset = $('#btnRemoveAsset');
    
    if (btnAddAsset) {
      btnAddAsset.addEventListener('click', () => this.addAsset());
      console.log('Add asset button listener added');
    } else {
      console.warn('Add asset button not found');
    }
    
    if (btnRemoveAsset) {
      btnRemoveAsset.addEventListener('click', () => this.removeAsset());
      console.log('Remove asset button listener added');
    } else {
      console.warn('Remove asset button not found');
    }
    
    // Market generation
    const btnGenerate = $('#btnGenerate');
    if (btnGenerate) {
      btnGenerate.addEventListener('click', () => this.generateMarket());
      console.log('Generate market button listener added');
    } else {
      console.warn('Generate market button not found');
    }
    
    // Strategy selection
    const strategySelect = $('#strategyType');
    if (strategySelect) {
      strategySelect.addEventListener('change', (e) => this.onStrategyChange(e.target.value));
      console.log('Strategy selector listener added');
    } else {
      console.warn('Strategy selector not found');
    }
    
    // Backtesting
    const btnBacktest = $('#btnBacktest');
    if (btnBacktest) {
      btnBacktest.addEventListener('click', () => this.runBacktest());
      console.log('Backtest button listener added');
    } else {
      console.warn('Backtest button not found');
    }
    
    const btnResetStrat = $('#btnResetStrat');
    if (btnResetStrat) {
      btnResetStrat.addEventListener('click', () => this.resetStrategy());
      console.log('Reset strategy button listener added');
    } else {
      console.warn('Reset strategy button not found');
    }
    
    // Report actions
    const btnExportReport = $('#btnExportReport');
    if (btnExportReport) {
      btnExportReport.addEventListener('click', () => this.exportReport());
      console.log('Export report button listener added');
    } else {
      console.warn('Export report button not found');
    }
    
    const btnSaveStrategy = $('#btnSaveStrategy');
    if (btnSaveStrategy) {
      btnSaveStrategy.addEventListener('click', () => this.saveStrategy());
      console.log('Save strategy button listener added');
    } else {
      console.warn('Save strategy button not found');
    }
    
    const btnLoadStrategy = $('#btnLoadStrategy');
    if (btnLoadStrategy) {
      btnLoadStrategy.addEventListener('click', () => this.loadStrategy());
      console.log('Load strategy button listener added');
    } else {
      console.warn('Load strategy button not found');
    }
    
    // Settings changes
    this.setupSettingsListeners();
    console.log('Event listeners setup complete');
  }

  // Setup settings change listeners
  setupSettingsListeners() {
    const settingsInputs = [
      'candles', 'seed', 'fee', 'initialCapital'
    ];
    
    settingsInputs.forEach(id => {
      const element = $(`#${id}`);
      if (element) {
        element.addEventListener('change', (e) => {
          this.state.settings[id] = e.target.value;
          this.saveState();
        });
      }
    });
  }

  // Render asset selector
  renderAssetSelector() {
    console.log('Rendering asset selector...');
    const container = $('#assetSelector');
    if (!container) {
      console.error('Asset selector container not found');
      return;
    }
    
    container.innerHTML = '';
    console.log('Container cleared, rendering assets...');
    
    // Add asset selection checkboxes
    Object.entries(ASSETS).forEach(([key, asset]) => {
      console.log('Creating asset option for:', key, asset);
      const isSelected = this.state.selectedAssets.includes(key);
      
      const checkbox = dom.create('input', {
        type: 'checkbox',
        id: `asset_${key}`,
        checked: isSelected
      });
      
      const label = dom.create('label', {
        htmlFor: `asset_${key}`,
        textContent: asset.name
      });
      
      const div = dom.create('div', {
        className: 'asset-option'
      }, [checkbox, label]);
      
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.addAsset(key);
        } else {
          this.removeAsset(key);
        }
      });
      
      container.appendChild(div);
      console.log('Asset option added for:', key);
    });
    
    // Add asset count display
    const countDiv = dom.create('div', {
      className: 'asset-count',
      textContent: `${this.state.selectedAssets.length} asset(s) selected`
    });
    container.appendChild(countDiv);
    
    console.log('Asset selector rendering complete');
  }

  // Render strategy selector
  renderStrategySelector() {
    const container = $('#strategySelector');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Strategy type selector
    const typeSelect = dom.create('select', {
      id: 'strategyType'
    });
    
    Object.entries(STRATEGY_TEMPLATES).forEach(([key, template]) => {
      const option = dom.create('option', {
        value: key,
        textContent: template.name
      });
      typeSelect.appendChild(option);
    });
    
    const customOption = dom.create('option', {
      value: 'custom',
      textContent: 'Custom JavaScript'
    });
    typeSelect.appendChild(customOption);
    
    typeSelect.value = this.state.strategy.type;
    typeSelect.addEventListener('change', (e) => this.onStrategyChange(e.target.value));
    
    container.appendChild(typeSelect);
    
    // Render strategy parameters
    this.renderStrategyParams();
  }

  // Render strategy parameters based on selected type
  renderStrategyParams() {
    const container = $('#strategyParams');
    if (!container) return;
    
    container.innerHTML = '';
    
    const strategyType = this.state.strategy.type;
    
    if (strategyType === 'custom') {
      this.renderCustomStrategyInput();
    } else if (STRATEGY_TEMPLATES[strategyType]) {
      this.renderTemplateParams(STRATEGY_TEMPLATES[strategyType]);
    }
  }

  // Render template strategy parameters
  renderTemplateParams(template) {
    const container = $('#strategyParams');
    
    Object.entries(template.params).forEach(([key, param]) => {
      const label = dom.create('label', {
        textContent: param.label
      });
      
      const input = dom.create('input', {
        type: 'number',
        id: `param_${key}`,
        min: param.min,
        max: param.max,
        step: param.step,
        value: this.state.strategy.params[key] || param.value
      });
      
      input.addEventListener('change', (e) => {
        this.state.strategy.params[key] = parseFloat(e.target.value);
        this.saveState();
      });
      
      const div = dom.create('div', {
        className: 'param-group'
      }, [label, input]);
      
      container.appendChild(div);
    });
  }

  // Render custom strategy input
  renderCustomStrategyInput() {
    const container = $('#strategyParams');
    
    const label = dom.create('label', {
      textContent: 'Custom Strategy Code'
    });
    
    const textarea = dom.create('textarea', {
      id: 'customStrategyCode',
      placeholder: '// Write your custom strategy here...\n// Must return -1 (short), 0 (flat), or 1 (long)',
      value: this.state.strategy.customCode
    });
    
    textarea.addEventListener('input', (e) => {
      this.state.strategy.customCode = e.target.value;
      this.saveState();
    });
    
    const helpText = dom.create('div', {
      className: 'help-text',
      textContent: 'Available context: i (index), prices (array), position (current), indicators (technical indicators), helpers (utility functions)'
    });
    
    const div = dom.create('div', {
      className: 'param-group'
    }, [label, textarea, helpText]);
    
    container.appendChild(div);
  }

  // Add asset to selection
  addAsset(assetKey = null) {
    console.log('Adding asset:', assetKey);
    
    if (!assetKey) {
      // Show asset picker
      const availableAssets = Object.keys(ASSETS).filter(key => 
        !this.state.selectedAssets.includes(key)
      );
      
      console.log('Available assets:', availableAssets);
      
      if (availableAssets.length === 0) {
        alert('All assets are already selected');
        return;
      }
      
      assetKey = availableAssets[0]; // For now, just add the first available
    }
    
    if (!this.state.selectedAssets.includes(assetKey)) {
      this.state.selectedAssets.push(assetKey);
      console.log('Updated selected assets:', this.state.selectedAssets);
      this.saveState();
      this.renderAssetSelector();
    }
  }

  // Remove asset from selection
  removeAsset(assetKey = null) {
    console.log('Removing asset:', assetKey);
    
    if (!assetKey) {
      if (this.state.selectedAssets.length > 1) {
        assetKey = this.state.selectedAssets[this.state.selectedAssets.length - 1];
      } else {
        alert('At least one asset must be selected');
        return;
      }
    }
    
    const index = this.state.selectedAssets.indexOf(assetKey);
    if (index > -1) {
      this.state.selectedAssets.splice(index, 1);
      console.log('Updated selected assets:', this.state.selectedAssets);
      this.saveState();
      this.renderAssetSelector();
    }
  }

  // Generate market data
  async generateMarket() {
    console.log('Generating market for assets:', this.state.selectedAssets);
    
    try {
      const settings = {
        candles: parseInt($('#candles')?.value || this.state.settings.candles),
        seed: $('#seed')?.value || this.state.settings.seed,
        correlationMatrix: null // Will be auto-generated
      };
      
      console.log('Market settings:', settings);
      
      this.currentMarketData = this.marketGenerator.generateMultiAssetMarket(
        this.state.selectedAssets,
        settings
      );
      
      console.log('Market data generated:', this.currentMarketData);
      
      this.updateMarketDisplay();
      this.saveState();
      
      // Reset backtest results
      this.currentResults = null;
      this.updateResultsDisplay();
      
    } catch (error) {
      console.error('Error generating market:', error);
      alert('Error generating market data: ' + error.message);
    }
  }

  // Update market display
  updateMarketDisplay() {
    if (!this.currentMarketData) return;
    
    // Update KPI displays
    const stats = this.marketGenerator.getMarketStats();
    
    $('#kpiCandles')?.textContent = fmt.number(this.currentMarketData.timestamps.length);
    $('#kpiAssets')?.textContent = Object.keys(this.currentMarketData.assets).length;
    
    // Update correlation and volatility KPIs
    if (this.currentMarketData.assets && Object.keys(this.currentMarketData.assets).length > 1) {
      const correlations = Object.values(this.currentMarketData.correlationMatrix)
        .flat()
        .filter(c => c !== 1); // Exclude self-correlations
      const avgCorrelation = correlations.reduce((a, b) => a + b, 0) / correlations.length;
      $('#kpiCorrelation')?.textContent = fmt.percentage(avgCorrelation * 100, 1);
    }
    
    // Calculate average volatility
    if (stats) {
      const volatilities = Object.values(stats).map(s => s.volatility);
      const avgVolatility = volatilities.reduce((a, b) => a + b, 0) / volatilities.length;
      $('#kpiVolatility')?.textContent = fmt.percentage(avgVolatility, 1);
    }
    
    // Update charts
    this.renderMarketCharts();
  }

  // Render market charts
  renderMarketCharts() {
    if (!this.currentMarketData) return;
    
    // Price charts
    this.renderPriceChart();
    
    // Correlation matrix
    this.renderCorrelationMatrix();
  }

  // Render price chart
  renderPriceChart() {
    const canvas = $('#chartPrices');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw price series for each asset
    Object.entries(this.currentMarketData.assets).forEach(([key, asset]) => {
      const prices = asset.prices;
      const color = asset.color;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      prices.forEach((price, i) => {
        const x = (i / (prices.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((price - Math.min(...prices)) / (Math.max(...prices) - Math.min(...prices))) * (height - 40);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    });
  }

  // Render correlation matrix
  renderCorrelationMatrix() {
    const container = $('#correlationMatrix');
    if (!container) return;
    
    container.innerHTML = '';
    
    const assets = Object.keys(this.currentMarketData.assets);
    if (assets.length < 2) return;
    
    const table = dom.create('table', {
      className: 'correlation-table'
    });
    
    // Header row
    const headerRow = dom.create('tr');
    headerRow.appendChild(dom.create('th', { textContent: 'Asset' }));
    assets.forEach(assetKey => {
      headerRow.appendChild(dom.create('th', { textContent: ASSETS[assetKey].symbol }));
    });
    table.appendChild(headerRow);
    
    // Data rows
    assets.forEach(asset1 => {
      const row = dom.create('tr');
      row.appendChild(dom.create('td', { textContent: ASSETS[asset1].symbol }));
      
      assets.forEach(asset2 => {
        const correlation = this.currentMarketData.correlationMatrix[asset1][asset2];
        const cell = dom.create('td', { 
          textContent: correlation.toFixed(2),
          className: correlation > 0.5 ? 'high-correlation' : correlation < -0.5 ? 'low-correlation' : 'medium-correlation'
        });
        row.appendChild(cell);
      });
      
      table.appendChild(row);
    });
    
    container.appendChild(table);
  }

  // Handle strategy type change
  onStrategyChange(strategyType) {
    this.state.strategy.type = strategyType;
    this.renderStrategyParams();
    this.saveState();
  }

  // Run backtest
  async runBacktest() {
    if (!this.currentMarketData) {
      alert('Please generate market data first');
      return;
    }
    
    try {
      // Create backtester instance
      this.backtester = new Backtester(this.currentMarketData, {
        fee: parseFloat($('#fee')?.value || this.state.settings.fee),
        initialCapital: parseFloat($('#initialCapital')?.value || this.state.settings.initialCapital)
      });
      
      // Prepare strategy configuration
      const strategyConfig = {
        type: this.state.strategy.type,
        params: this.state.strategy.params,
        customCode: this.state.strategy.customCode
      };
      
      // Run backtest
      this.currentResults = await this.backtester.runBacktest(strategyConfig);
      
      if (this.currentResults) {
        this.updateResultsDisplay();
        this.generateReport();
      }
      
    } catch (error) {
      console.error('Backtest error:', error);
      alert(`Backtest error: ${error.message}`);
    }
  }

  // Update results display
  updateResultsDisplay() {
    if (!this.currentResults) return;
    
    const { summary, details } = this.currentResults;
    
    // Update KPI displays
    $('#kpiTrades')?.textContent = fmt.number(details.totalTrades);
    $('#kpiRet')?.textContent = fmt.percentage(summary.totalReturn);
    $('#kpiDD')?.textContent = fmt.percentage(summary.maxDrawdown);
    $('#kpiSharpe')?.textContent = fmt.number(summary.sharpeRatio);
    
    // Render equity chart
    this.renderEquityChart();
    
    // Render trade analysis
    this.renderTradeAnalysis();
  }

  // Render equity chart
  renderEquityChart() {
    const canvas = $('#chartEquity');
    if (!canvas || !this.currentResults) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const equity = this.currentResults.equity;
    const minEquity = Math.min(...equity);
    const maxEquity = Math.max(...equity);
    
    ctx.strokeStyle = '#66e0a3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    equity.forEach((value, i) => {
      const x = (i / (equity.length - 1)) * (width - 40) + 20;
      const y = height - 20 - ((value - minEquity) / (maxEquity - minEquity)) * (height - 40);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }

  // Render trade analysis
  renderTradeAnalysis() {
    const container = $('#tradeAnalysis');
    if (!container || !this.currentResults) return;
    
    container.innerHTML = '';
    
    const { trades, details } = this.currentResults;
    
    if (trades.length === 0) {
      container.innerHTML = '<p>No trades executed</p>';
      return;
    }
    
    // Trade summary
    const summary = dom.create('div', {
      className: 'trade-summary'
    });
    
    summary.innerHTML = `
      <h4>Trade Summary</h4>
      <p>Total Trades: ${details.totalTrades}</p>
      <p>Profitable: ${details.profitableTrades}</p>
      <p>Win Rate: ${fmt.percentage((details.profitableTrades / details.totalTrades) * 100)}</p>
      <p>Total Fees: ${fmt.currency(details.totalFees)}</p>
    `;
    
    container.appendChild(summary);
    
    // Recent trades table
    const table = dom.create('table', {
      className: 'trades-table'
    });
    
    const headerRow = dom.create('tr');
    ['Date', 'Asset', 'Type', 'Price', 'Quantity', 'Cost'].forEach(header => {
      headerRow.appendChild(dom.create('th', { textContent: header }));
    });
    table.appendChild(headerRow);
    
    // Show last 10 trades
    const recentTrades = trades.slice(-10).reverse();
    recentTrades.forEach(trade => {
      const row = dom.create('tr');
      row.appendChild(dom.create('td', { textContent: fmt.date(trade.timestamp) }));
      row.appendChild(dom.create('td', { textContent: ASSETS[trade.asset]?.symbol || trade.asset }));
      row.appendChild(dom.create('td', { textContent: trade.type }));
      row.appendChild(dom.create('td', { textContent: fmt.currency(trade.price) }));
      row.appendChild(dom.create('td', { textContent: fmt.number(trade.quantity) }));
      row.appendChild(dom.create('td', { textContent: fmt.currency(trade.cost) }));
      table.appendChild(row);
    });
    
    container.appendChild(table);
  }

  // Generate comprehensive report
  generateReport() {
    if (!this.currentResults || !this.currentMarketData) return;
    
    this.reporter = new StrategyReporter(this.currentResults, this.currentMarketData);
    const report = this.reporter.generateReport();
    
    this.displayReport(report);
  }

  // Display report
  displayReport(report) {
    const container = $('#reportContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Summary section
    const summarySection = this.createReportSection('Summary', report.summary);
    container.appendChild(summarySection);
    
    // Performance section
    const performanceSection = this.createReportSection('Performance', report.performance);
    container.appendChild(performanceSection);
    
    // Risk section
    const riskSection = this.createReportSection('Risk Analysis', report.risk);
    container.appendChild(riskSection);
    
    // Trading section
    const tradingSection = this.createReportSection('Trading Analysis', report.trading);
    container.appendChild(tradingSection);
    
    // Recommendations section
    const recommendationsSection = this.createReportSection('Recommendations', report.recommendations);
    container.appendChild(recommendationsSection);
  }

  // Create report section
  createReportSection(title, data) {
    const section = dom.create('div', {
      className: 'report-section'
    });
    
    const header = dom.create('h3', { textContent: title });
    section.appendChild(header);
    
    if (Array.isArray(data)) {
      // Handle array data (like recommendations)
      data.forEach(item => {
        const div = dom.create('div', {
          className: `recommendation ${item.priority}`
        });
        div.innerHTML = `
          <strong>${item.category}</strong> (${item.priority} priority)<br>
          ${item.message}<br>
          <em>Action: ${item.action}</em>
        `;
        section.appendChild(div);
      });
    } else if (typeof data === 'object') {
      // Handle object data
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          const subsection = dom.create('div', {
            className: 'report-subsection'
          });
          subsection.innerHTML = `<h4>${string.capitalize(key)}</h4>`;
          
          Object.entries(value).forEach(([subKey, subValue]) => {
            const item = dom.create('div', {
              className: 'report-item'
            });
            item.innerHTML = `<strong>${string.capitalize(subKey)}:</strong> ${subValue}`;
            subsection.appendChild(item);
          });
          
          section.appendChild(subsection);
        } else {
          const item = dom.create('div', {
            className: 'report-item'
          });
          item.innerHTML = `<strong>${string.capitalize(key)}:</strong> ${value}`;
          section.appendChild(item);
        }
      });
    } else {
      // Handle simple values
      const item = dom.create('div', {
        className: 'report-item'
      });
      item.textContent = data;
      section.appendChild(item);
    }
    
    return section;
  }

  // Reset strategy
  resetStrategy() {
    this.currentResults = null;
    this.updateResultsDisplay();
    
    // Reset form fields
    if (this.state.strategy.type !== 'custom') {
      const template = STRATEGY_TEMPLATES[this.state.strategy.type];
      if (template) {
        Object.entries(template.params).forEach(([key, param]) => {
          const input = $(`#param_${key}`);
          if (input) input.value = param.value;
        });
      }
    }
    
    // Clear results display
    $('#kpiTrades')?.textContent = '0';
    $('#kpiRet')?.textContent = '—';
    $('#kpiDD')?.textContent = '—';
    $('#kpiSharpe')?.textContent = '—';
  }

  // Export report
  exportReport() {
    if (!this.reporter) {
      alert('No report available to export');
      return;
    }
    
    const report = this.reporter.exportToJSON();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  // Save strategy
  saveStrategy() {
    const strategyName = prompt('Enter strategy name:');
    if (!strategyName) return;
    
    const strategy = {
      name: strategyName,
      ...this.state.strategy,
      timestamp: new Date().toISOString()
    };
    
    const savedStrategies = storage.get('savedStrategies', []);
    savedStrategies.push(strategy);
    storage.set('savedStrategies', savedStrategies);
    
    alert('Strategy saved successfully!');
  }

  // Load strategy
  loadStrategy() {
    const savedStrategies = storage.get('savedStrategies', []);
    
    if (savedStrategies.length === 0) {
      alert('No saved strategies found');
      return;
    }
    
    const strategyNames = savedStrategies.map(s => s.name);
    const selectedName = prompt('Select strategy:\n' + strategyNames.join('\n'));
    
    if (!selectedName) return;
    
    const strategy = savedStrategies.find(s => s.name === selectedName);
    if (strategy) {
      this.state.strategy = strategy;
      this.renderStrategySelector();
      this.saveState();
      alert('Strategy loaded successfully!');
    } else {
      alert('Strategy not found');
    }
  }

  // Generate initial market
  generateInitialMarket() {
    this.generateMarket();
  }

  // Save application state
  saveState() {
    storage.set('tradingAppState', this.state);
  }

  // Load application state
  loadState() {
    const savedState = storage.get('tradingAppState');
    if (savedState) {
      this.state = { ...this.state, ...savedState };
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.tradingApp = new TradingApp();
});
