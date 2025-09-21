// Professional Trading Interface
// ExpertOption-style interface with dynamic strategy tools

export class TradingInterface {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chartEngine = null;
        this.isLive = false;
        this.currentStrategy = null;
        this.performanceMetrics = null;
        
        this.setupInterface();
        this.setupEventListeners();
    }
    
    setupInterface() {
        this.container.innerHTML = `
            <div class="trading-interface">
                <!-- Header Controls -->
                <div class="trading-header">
                    <div class="market-info">
                        <div class="asset-selector">
                            <select id="assetSelect">
                                <option value="XAUUSD">XAU/USD</option>
                                <option value="EURUSD">EUR/USD</option>
                                <option value="GBPUSD">GBP/USD</option>
                                <option value="USDJPY">USD/JPY</option>
                                <option value="BTCUSD">BTC/USD</option>
                                <option value="ETHUSD">ETH/USD</option>
                            </select>
                        </div>
                        <div class="timeframe-selector">
                            <select id="timeframeSelect">
                                <option value="1m">1 Minute</option>
                                <option value="5m">5 Minutes</option>
                                <option value="15m">15 Minutes</option>
                                <option value="1h" selected>1 Hour</option>
                                <option value="4h">4 Hours</option>
                                <option value="1d">1 Day</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="live-controls">
                        <button id="liveToggle" class="btn-live">Start Live Trading</button>
                        <div class="live-indicator" id="liveIndicator">
                            <span class="status-dot"></span>
                            <span class="status-text">DEMO</span>
                        </div>
                    </div>
                </div>
                
                <!-- Chart Container -->
                <div class="chart-container">
                    <canvas id="tradingChart" width="800" height="400"></canvas>
                    <div class="chart-overlay">
                        <div class="price-info" id="priceInfo">
                            <div class="current-price">$3,600.00</div>
                            <div class="price-change">+12.50 (+0.35%)</div>
                        </div>
                    </div>
                </div>
                
                <!-- Strategy Tools -->
                <div class="strategy-tools">
                    <div class="tool-group">
                        <h4>Strategy Tools</h4>
                        <div class="tool-buttons">
                            <button class="tool-btn" data-tool="entry" title="Entry Point (E)">
                                <span class="tool-icon">📍</span>
                                Entry
                            </button>
                            <button class="tool-btn" data-tool="stop" title="Stop Loss (S)">
                                <span class="tool-icon">🛑</span>
                                Stop Loss
                            </button>
                            <button class="tool-btn" data-tool="take" title="Take Profit (T)">
                                <span class="tool-icon">🎯</span>
                                Take Profit
                            </button>
                            <button class="tool-btn" data-tool="trend" title="Trend Line (L)">
                                <span class="tool-icon">📈</span>
                                Trend Line
                            </button>
                            <button class="tool-btn" data-tool="support" title="Support/Resistance (R)">
                                <span class="tool-icon">📊</span>
                                S/R Levels
                            </button>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button id="clearAll" class="btn-action">Clear All</button>
                        <button id="exportStrategy" class="btn-action">Export Strategy</button>
                        <button id="importStrategy" class="btn-action">Import Strategy</button>
                        <button id="executeStrategy" class="btn-action primary">Execute Strategy</button>
                    </div>
                </div>
                
                <!-- Strategy Elements Panel -->
                <div class="strategy-panel">
                    <h4>Strategy Elements</h4>
                    <div class="elements-list" id="elementsList">
                        <div class="empty-state">No strategy elements defined</div>
                    </div>
                </div>
                
                <!-- Performance Metrics -->
                <div class="performance-panel">
                    <h4>Performance Metrics</h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Total Trades</span>
                            <span class="metric-value" id="totalTrades">0</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Win Rate</span>
                            <span class="metric-value" id="winRate">0%</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Total Return</span>
                            <span class="metric-value" id="totalReturn">0%</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Max Drawdown</span>
                            <span class="metric-value" id="maxDrawdown">0%</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Sharpe Ratio</span>
                            <span class="metric-value" id="sharpeRatio">0.0</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Profit Factor</span>
                            <span class="metric-value" id="profitFactor">0.0</span>
                        </div>
                    </div>
                </div>
                
                <!-- Strategy Execution Panel -->
                <div class="execution-panel" id="executionPanel" style="display: none;">
                    <h4>Strategy Execution</h4>
                    <div class="execution-controls">
                        <div class="position-settings">
                            <label for="positionSize">Position Size:</label>
                            <input type="number" id="positionSize" value="1" min="0.01" step="0.01">
                            <select id="positionUnit">
                                <option value="units">Units</option>
                                <option value="percentage">% of Account</option>
                            </select>
                        </div>
                        
                        <div class="risk-settings">
                            <label for="riskPercentage">Risk per Trade:</label>
                            <input type="number" id="riskPercentage" value="2" min="0.1" max="10" step="0.1">
                            <span>%</span>
                        </div>
                        
                        <div class="execution-buttons">
                            <button id="startExecution" class="btn-execute">Start Execution</button>
                            <button id="stopExecution" class="btn-stop">Stop Execution</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initializeChart();
    }
    
    initializeChart() {
        // Initialize the chart engine
        this.chartEngine = new window.RealTimeChartEngine('tradingChart', {
            width: 800,
            height: 400,
            backgroundColor: '#0a0a0a',
            gridColor: '#1a1a1a',
            bullColor: '#00d4aa',
            bearColor: '#ef4444',
            textColor: '#e8e8e8'
        });
    }
    
    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.selectTool(tool);
            });
        });
        
        // Action buttons
        document.getElementById('liveToggle').addEventListener('click', () => {
            this.toggleLiveTrading();
        });
        
        document.getElementById('clearAll').addEventListener('click', () => {
            this.clearAllElements();
        });
        
        document.getElementById('exportStrategy').addEventListener('click', () => {
            this.exportStrategy();
        });
        
        document.getElementById('importStrategy').addEventListener('click', () => {
            this.importStrategy();
        });
        
        document.getElementById('executeStrategy').addEventListener('click', () => {
            this.executeStrategy();
        });
        
        // Chart events
        document.addEventListener('entryAdded', (e) => {
            this.updateElementsList();
        });
        
        document.addEventListener('stopLossAdded', (e) => {
            this.updateElementsList();
        });
        
        document.addEventListener('takeProfitAdded', (e) => {
            this.updateElementsList();
        });
        
        document.addEventListener('supportResistanceAdded', (e) => {
            this.updateElementsList();
        });
        
        document.addEventListener('liveStatusChange', (e) => {
            this.updateLiveStatus(e.detail.isLive);
        });
        
        // Asset and timeframe changes
        document.getElementById('assetSelect').addEventListener('change', (e) => {
            this.changeAsset(e.target.value);
        });
        
        document.getElementById('timeframeSelect').addEventListener('change', (e) => {
            this.changeTimeframe(e.target.value);
        });
    }
    
    selectTool(tool) {
        // Remove active class from all tools
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected tool
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        
        // Set tool in chart engine
        this.chartEngine.setDrawingTool(tool);
    }
    
    toggleLiveTrading() {
        this.isLive = !this.isLive;
        
        if (this.isLive) {
            this.chartEngine.startLiveTrading();
            document.getElementById('liveToggle').textContent = 'Stop Live Trading';
            document.getElementById('liveToggle').classList.add('active');
        } else {
            this.chartEngine.stopLiveTrading();
            document.getElementById('liveToggle').textContent = 'Start Live Trading';
            document.getElementById('liveToggle').classList.remove('active');
        }
    }
    
    updateLiveStatus(isLive) {
        const indicator = document.getElementById('liveIndicator');
        const statusDot = indicator.querySelector('.status-dot');
        const statusText = indicator.querySelector('.status-text');
        
        if (isLive) {
            statusDot.classList.add('live');
            statusText.textContent = 'LIVE';
        } else {
            statusDot.classList.remove('live');
            statusText.textContent = 'DEMO';
        }
    }
    
    updateElementsList() {
        const list = document.getElementById('elementsList');
        const elements = [
            ...this.chartEngine.entryPoints.map(e => ({ ...e, label: 'Entry Point' })),
            ...this.chartEngine.stopLosses.map(e => ({ ...e, label: 'Stop Loss' })),
            ...this.chartEngine.takeProfits.map(e => ({ ...e, label: 'Take Profit' })),
            ...this.chartEngine.supportResistance.map(e => ({ ...e, label: 'Support/Resistance' }))
        ];
        
        if (elements.length === 0) {
            list.innerHTML = '<div class="empty-state">No strategy elements defined</div>';
            return;
        }
        
        list.innerHTML = elements.map(element => `
            <div class="element-item" data-id="${element.id}">
                <div class="element-info">
                    <span class="element-type">${element.label}</span>
                    <span class="element-price">$${element.price.toFixed(2)}</span>
                    <span class="element-time">${new Date(element.time).toLocaleTimeString()}</span>
                </div>
                <div class="element-actions">
                    <button class="btn-remove" onclick="removeElement(${element.id})">×</button>
                </div>
            </div>
        `).join('');
    }
    
    clearAllElements() {
        if (confirm('Are you sure you want to clear all strategy elements?')) {
            this.chartEngine.clearAllElements();
            this.updateElementsList();
            this.updatePerformanceMetrics(null);
        }
    }
    
    exportStrategy() {
        const strategy = this.chartEngine.exportStrategy();
        const blob = new Blob([JSON.stringify(strategy, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategy_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    importStrategy() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const strategy = JSON.parse(e.target.result);
                        this.chartEngine.importStrategy(strategy);
                        this.updateElementsList();
                    } catch (error) {
                        alert('Error importing strategy: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    executeStrategy() {
        const strategy = this.chartEngine.executeStrategy();
        this.performanceMetrics = strategy;
        this.updatePerformanceMetrics(strategy);
        this.showExecutionPanel();
    }
    
    updatePerformanceMetrics(metrics) {
        if (!metrics) {
            document.getElementById('totalTrades').textContent = '0';
            document.getElementById('winRate').textContent = '0%';
            document.getElementById('totalReturn').textContent = '0%';
            document.getElementById('maxDrawdown').textContent = '0%';
            document.getElementById('sharpeRatio').textContent = '0.0';
            document.getElementById('profitFactor').textContent = '0.0';
            return;
        }
        
        document.getElementById('totalTrades').textContent = metrics.totalTrades || 0;
        document.getElementById('winRate').textContent = `${(metrics.winRate * 100).toFixed(1)}%`;
        document.getElementById('totalReturn').textContent = `${metrics.totalReturn.toFixed(2)}%`;
        document.getElementById('maxDrawdown').textContent = `${metrics.maxDrawdown.toFixed(2)}%`;
        document.getElementById('sharpeRatio').textContent = metrics.sharpeRatio.toFixed(2);
        document.getElementById('profitFactor').textContent = (metrics.profitFactor || 0).toFixed(2);
    }
    
    showExecutionPanel() {
        document.getElementById('executionPanel').style.display = 'block';
        
        // Setup execution controls
        document.getElementById('startExecution').addEventListener('click', () => {
            this.startStrategyExecution();
        });
        
        document.getElementById('stopExecution').addEventListener('click', () => {
            this.stopStrategyExecution();
        });
    }
    
    startStrategyExecution() {
        const positionSize = parseFloat(document.getElementById('positionSize').value);
        const riskPercentage = parseFloat(document.getElementById('riskPercentage').value);
        
        // Start live strategy execution
        console.log('Starting strategy execution:', { positionSize, riskPercentage });
        
        document.getElementById('startExecution').disabled = true;
        document.getElementById('stopExecution').disabled = false;
    }
    
    stopStrategyExecution() {
        // Stop live strategy execution
        console.log('Stopping strategy execution');
        
        document.getElementById('startExecution').disabled = false;
        document.getElementById('stopExecution').disabled = true;
    }
    
    changeAsset(asset) {
        console.log('Changing asset to:', asset);
        // Implement asset change logic
        // This would typically involve fetching new market data
    }
    
    changeTimeframe(timeframe) {
        console.log('Changing timeframe to:', timeframe);
        // Implement timeframe change logic
        // This would typically involve resampling the data
    }
}

// Global function for element removal
window.removeElement = function(id) {
    // This would need to be connected to the chart engine
    console.log('Removing element:', id);
};
