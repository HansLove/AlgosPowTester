// Advanced Real-Time Chart Engine
// Similar to ExpertOption with dynamic strategy definition

export class RealTimeChartEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.options = {
            width: 800,
            height: 400,
            candleWidth: 8,
            candleSpacing: 2,
            backgroundColor: '#0a0a0a',
            gridColor: '#1a1a1a',
            bullColor: '#00d4aa',
            bearColor: '#ef4444',
            textColor: '#e8e8e8',
            ...options
        };
        
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        
        this.data = [];
        this.realTimeData = [];
        this.currentPrice = 3600;
        this.isLive = false;
        this.startTime = Date.now();
        
        // Chart interaction
        this.mousePos = { x: 0, y: 0 };
        this.isDrawing = false;
        this.drawingTool = 'none';
        this.drawnElements = [];
        this.selectedElement = null;
        
        // Strategy elements
        this.entryPoints = [];
        this.stopLosses = [];
        this.takeProfits = [];
        this.trendLines = [];
        this.supportResistance = [];
        
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }
    
    setupEventListeners() {
        // Mouse events for chart interaction
        this.canvas.addEventListener('mousemove', (e) => {
            this.mousePos = this.getMousePos(e);
            this.updateCursor();
        });
        
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.startDrawing(e);
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.isDrawing = false;
            this.finishDrawing(e);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    handleKeyboardShortcuts(e) {
        switch(e.key) {
            case 'e':
                this.setDrawingTool('entry');
                break;
            case 's':
                this.setDrawingTool('stop');
                break;
            case 't':
                this.setDrawingTool('take');
                break;
            case 'l':
                this.setDrawingTool('trend');
                break;
            case 'r':
                this.setDrawingTool('support');
                break;
            case 'Escape':
                this.setDrawingTool('none');
                break;
            case 'Delete':
                this.deleteSelectedElement();
                break;
        }
    }
    
    setDrawingTool(tool) {
        this.drawingTool = tool;
        this.updateCursor();
        this.notifyToolChange(tool);
    }
    
    updateCursor() {
        const cursors = {
            'none': 'default',
            'entry': 'crosshair',
            'stop': 'crosshair',
            'take': 'crosshair',
            'trend': 'crosshair',
            'support': 'crosshair'
        };
        this.canvas.style.cursor = cursors[this.drawingTool] || 'default';
    }
    
    handleCanvasClick(e) {
        const price = this.getPriceFromY(this.mousePos.y);
        const time = this.getTimeFromX(this.mousePos.x);
        
        switch(this.drawingTool) {
            case 'entry':
                this.addEntryPoint(time, price);
                break;
            case 'stop':
                this.addStopLoss(time, price);
                break;
            case 'take':
                this.addTakeProfit(time, price);
                break;
            case 'trend':
                this.startTrendLine(time, price);
                break;
            case 'support':
                this.addSupportResistance(time, price);
                break;
        }
    }
    
    startRealTimeUpdates() {
        // Simulate real-time price updates
        setInterval(() => {
            if (this.isLive) {
                this.updateRealTimePrice();
                this.redraw();
            }
        }, 100); // 10 FPS for smooth updates
        
        // Add new candles every 5 seconds
        setInterval(() => {
            if (this.isLive) {
                this.addNewCandle();
            }
        }, 5000);
    }
    
    updateRealTimePrice() {
        // Simulate realistic price movement
        const volatility = 0.001; // 0.1% volatility per update
        const trend = 0.0001; // Slight upward bias
        const randomFactor = (Math.random() - 0.5) * 2;
        const change = this.currentPrice * (trend + randomFactor * volatility);
        
        this.currentPrice += change;
        
        // Update real-time data
        const now = Date.now();
        this.realTimeData.push({
            time: now,
            price: this.currentPrice,
            volume: Math.random() * 1000 + 500
        });
        
        // Keep only last 100 data points for performance
        if (this.realTimeData.length > 100) {
            this.realTimeData.shift();
        }
    }
    
    addNewCandle() {
        const now = Date.now();
        const prices = this.realTimeData.map(d => d.price);
        const high = Math.max(...prices);
        const low = Math.min(...prices);
        const open = this.realTimeData[0]?.price || this.currentPrice;
        const close = this.currentPrice;
        
        this.data.push({
            time: now,
            open,
            high,
            low,
            close,
            volume: this.realTimeData.reduce((sum, d) => sum + d.volume, 0)
        });
        
        // Keep only last 200 candles
        if (this.data.length > 200) {
            this.data.shift();
        }
        
        // Clear real-time data for next candle
        this.realTimeData = [];
    }
    
    startLiveTrading() {
        this.isLive = true;
        this.notifyLiveStatus(true);
    }
    
    stopLiveTrading() {
        this.isLive = false;
        this.notifyLiveStatus(false);
    }
    
    // Drawing tools implementation
    addEntryPoint(time, price) {
        const entry = {
            type: 'entry',
            time,
            price,
            id: Date.now(),
            active: true
        };
        
        this.entryPoints.push(entry);
        this.notifyEntryAdded(entry);
        this.redraw();
    }
    
    addStopLoss(time, price) {
        const stop = {
            type: 'stop',
            time,
            price,
            id: Date.now(),
            active: true
        };
        
        this.stopLosses.push(stop);
        this.notifyStopLossAdded(stop);
        this.redraw();
    }
    
    addTakeProfit(time, price) {
        const take = {
            type: 'take',
            time,
            price,
            id: Date.now(),
            active: true
        };
        
        this.takeProfits.push(take);
        this.notifyTakeProfitAdded(take);
        this.redraw();
    }
    
    addSupportResistance(time, price) {
        const level = {
            type: 'support',
            time,
            price,
            id: Date.now(),
            active: true
        };
        
        this.supportResistance.push(level);
        this.notifySupportResistanceAdded(level);
        this.redraw();
    }
    
    // Chart rendering
    redraw() {
        this.clearCanvas();
        this.drawGrid();
        this.drawCandles();
        this.drawRealTimeLine();
        this.drawStrategyElements();
        this.drawCrosshair();
        this.drawPriceLabels();
    }
    
    clearCanvas() {
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.options.gridColor;
        this.ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i < 10; i++) {
            const x = (this.canvas.width / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i < 8; i++) {
            const y = (this.canvas.height / 8) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawCandles() {
        if (this.data.length === 0) return;
        
        const candleWidth = this.options.candleWidth;
        const spacing = this.options.candleSpacing;
        const totalWidth = candleWidth + spacing;
        
        const visibleCandles = Math.floor(this.canvas.width / totalWidth);
        const startIndex = Math.max(0, this.data.length - visibleCandles);
        
        for (let i = startIndex; i < this.data.length; i++) {
            const candle = this.data[i];
            const x = (i - startIndex) * totalWidth + candleWidth / 2;
            
            this.drawCandle(x, candle);
        }
    }
    
    drawCandle(x, candle) {
        const { open, high, low, close } = candle;
        const isBullish = close > open;
        
        // Candle body
        this.ctx.fillStyle = isBullish ? this.options.bullColor : this.options.bearColor;
        const bodyTop = Math.min(open, close);
        const bodyBottom = Math.max(open, close);
        const bodyHeight = Math.abs(close - open);
        
        this.ctx.fillRect(
            x - this.options.candleWidth / 2,
            this.getYFromPrice(bodyTop),
            this.options.candleWidth,
            Math.max(1, this.getPriceRange() * bodyHeight)
        );
        
        // Wicks
        this.ctx.strokeStyle = isBullish ? this.options.bullColor : this.options.bearColor;
        this.ctx.lineWidth = 1;
        
        // High wick
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.getYFromPrice(high));
        this.ctx.lineTo(x, this.getYFromPrice(bodyTop));
        this.ctx.stroke();
        
        // Low wick
        this.ctx.beginPath();
        this.ctx.moveTo(x, this.getYFromPrice(bodyBottom));
        this.ctx.lineTo(x, this.getYFromPrice(low));
        this.ctx.stroke();
    }
    
    drawRealTimeLine() {
        if (this.realTimeData.length === 0) return;
        
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.realTimeData.forEach((point, index) => {
            const x = this.canvas.width - (this.realTimeData.length - index) * 2;
            const y = this.getYFromPrice(point.price);
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawStrategyElements() {
        // Draw entry points
        this.entryPoints.forEach(entry => {
            this.drawEntryPoint(entry);
        });
        
        // Draw stop losses
        this.stopLosses.forEach(stop => {
            this.drawStopLoss(stop);
        });
        
        // Draw take profits
        this.takeProfits.forEach(take => {
            this.drawTakeProfit(take);
        });
        
        // Draw support/resistance
        this.supportResistance.forEach(level => {
            this.drawSupportResistance(level);
        });
    }
    
    drawEntryPoint(entry) {
        const x = this.getXFromTime(entry.time);
        const y = this.getYFromPrice(entry.price);
        
        this.ctx.fillStyle = '#00d4aa';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Label
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.font = '12px Arial';
        this.ctx.fillText('ENTRY', x + 10, y - 10);
    }
    
    drawStopLoss(stop) {
        const x = this.getXFromTime(stop.time);
        const y = this.getYFromPrice(stop.price);
        
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - 10, y);
        this.ctx.lineTo(x + 10, y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // Label
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.font = '12px Arial';
        this.ctx.fillText('SL', x + 10, y + 5);
    }
    
    drawTakeProfit(take) {
        const x = this.getXFromTime(take.time);
        const y = this.getYFromPrice(take.price);
        
        this.ctx.strokeStyle = '#00d4aa';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x - 10, y);
        this.ctx.lineTo(x + 10, y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // Label
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.font = '12px Arial';
        this.ctx.fillText('TP', x + 10, y + 5);
    }
    
    drawSupportResistance(level) {
        const x = this.getXFromTime(level.time);
        const y = this.getYFromPrice(level.price);
        
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // Label
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.font = '12px Arial';
        this.ctx.fillText('S/R', x + 10, y - 5);
    }
    
    drawCrosshair() {
        if (this.mousePos.x < 0 || this.mousePos.y < 0) return;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Vertical line
        this.ctx.beginPath();
        this.ctx.moveTo(this.mousePos.x, 0);
        this.ctx.lineTo(this.mousePos.x, this.canvas.height);
        this.ctx.stroke();
        
        // Horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.mousePos.y);
        this.ctx.lineTo(this.canvas.width, this.mousePos.y);
        this.ctx.stroke();
    }
    
    drawPriceLabels() {
        const price = this.getPriceFromY(this.mousePos.y);
        const time = new Date(this.getTimeFromX(this.mousePos.x)).toLocaleTimeString();
        
        // Price label
        this.ctx.fillStyle = '#d4af37';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(`$${price.toFixed(2)}`, 10, 25);
        
        // Time label
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.font = '12px Arial';
        this.ctx.fillText(time, 10, 45);
    }
    
    // Utility functions
    getYFromPrice(price) {
        const priceRange = this.getPriceRange();
        const minPrice = this.getMinPrice();
        return this.canvas.height - ((price - minPrice) / priceRange) * this.canvas.height;
    }
    
    getPriceFromY(y) {
        const priceRange = this.getPriceRange();
        const minPrice = this.getMinPrice();
        return minPrice + ((this.canvas.height - y) / this.canvas.height) * priceRange;
    }
    
    getXFromTime(time) {
        const timeRange = this.getTimeRange();
        const minTime = this.getMinTime();
        return ((time - minTime) / timeRange) * this.canvas.width;
    }
    
    getTimeFromX(x) {
        const timeRange = this.getTimeRange();
        const minTime = this.getMinTime();
        return minTime + (x / this.canvas.width) * timeRange;
    }
    
    getPriceRange() {
        const allPrices = [
            ...this.data.flatMap(d => [d.open, d.high, d.low, d.close]),
            ...this.realTimeData.map(d => d.price),
            this.currentPrice
        ];
        
        if (allPrices.length === 0) return 100;
        
        const min = Math.min(...allPrices);
        const max = Math.max(...allPrices);
        return Math.max(100, max - min) * 1.1; // 10% padding
    }
    
    getMinPrice() {
        const allPrices = [
            ...this.data.flatMap(d => [d.open, d.high, d.low, d.close]),
            ...this.realTimeData.map(d => d.price),
            this.currentPrice
        ];
        
        if (allPrices.length === 0) return this.currentPrice - 50;
        
        const min = Math.min(...allPrices);
        const max = Math.max(...allPrices);
        return min - (max - min) * 0.05; // 5% padding
    }
    
    getTimeRange() {
        if (this.data.length === 0) return 300000; // 5 minutes default
        
        const min = this.data[0].time;
        const max = this.data[this.data.length - 1].time;
        return max - min;
    }
    
    getMinTime() {
        if (this.data.length === 0) return Date.now() - 300000;
        return this.data[0].time;
    }
    
    // Event notifications
    notifyToolChange(tool) {
        const event = new CustomEvent('chartToolChange', { detail: { tool } });
        document.dispatchEvent(event);
    }
    
    notifyEntryAdded(entry) {
        const event = new CustomEvent('entryAdded', { detail: { entry } });
        document.dispatchEvent(event);
    }
    
    notifyStopLossAdded(stop) {
        const event = new CustomEvent('stopLossAdded', { detail: { stop } });
        document.dispatchEvent(event);
    }
    
    notifyTakeProfitAdded(take) {
        const event = new CustomEvent('takeProfitAdded', { detail: { take } });
        document.dispatchEvent(event);
    }
    
    notifySupportResistanceAdded(level) {
        const event = new CustomEvent('supportResistanceAdded', { detail: { level } });
        document.dispatchEvent(event);
    }
    
    notifyLiveStatus(isLive) {
        const event = new CustomEvent('liveStatusChange', { detail: { isLive } });
        document.dispatchEvent(event);
    }
    
    // Strategy execution
    executeStrategy() {
        const strategy = {
            entries: this.entryPoints,
            stops: this.stopLosses,
            takes: this.takeProfits,
            support: this.supportResistance
        };
        
        return this.runStrategyBacktest(strategy);
    }
    
    runStrategyBacktest(strategy) {
        // Implement strategy backtesting logic
        // This would integrate with your existing backtester
        return {
            totalTrades: strategy.entries.length,
            winRate: 0.65,
            totalReturn: 12.5,
            maxDrawdown: 5.2,
            sharpeRatio: 1.8
        };
    }
    
    // Data export
    exportStrategy() {
        return {
            entries: this.entryPoints,
            stops: this.stopLosses,
            takes: this.takeProfits,
            support: this.supportResistance,
            timestamp: Date.now()
        };
    }
    
    importStrategy(strategyData) {
        this.entryPoints = strategyData.entries || [];
        this.stopLosses = strategyData.stops || [];
        this.takeProfits = strategyData.takes || [];
        this.supportResistance = strategyData.support || [];
        this.redraw();
    }
    
    clearAllElements() {
        this.entryPoints = [];
        this.stopLosses = [];
        this.takeProfits = [];
        this.supportResistance = [];
        this.redraw();
    }
}
