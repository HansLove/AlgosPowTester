# Advanced Trading Algorithm Tester

A professional-grade, modular trading algorithm testing platform that allows traders to input their strategies, run comprehensive simulations, and receive detailed analysis reports on strategy performance and market characteristics.

## 🚀 Features

### Multi-Asset Support
- **Bitcoin (BTC)** - High volatility crypto asset
- **Gold (XAU)** - Traditional safe-haven asset
- **S&P 500 Index** - Major US equity index
- **NASDAQ Composite** - Technology-focused index
- **Ethereum (ETH)** - Smart contract platform
- **US Dollar Index** - Currency strength indicator

### Advanced Market Simulation
- **Realistic Correlations** - Assets maintain realistic inter-relationships
- **Geometric Brownian Motion** - Sophisticated price modeling
- **Cholesky Decomposition** - Proper correlation matrix implementation
- **Configurable Parameters** - Customize volatility, drift, and time periods

### Built-in Strategy Templates
- **Moving Average Crossover** - Golden/Death cross detection
- **RSI Mean Reversion** - Oversold/Overbought signals
- **Bollinger Bands** - Price channel breakouts
- **MACD Crossover** - Momentum trend changes
- **Custom JavaScript** - Write your own strategies

### Comprehensive Backtesting Engine
- **Multi-Asset Support** - Test strategies across multiple instruments
- **Realistic Trading Costs** - Includes fees and slippage
- **Position Management** - Long, short, and flat positions
- **Risk Metrics** - Drawdown, volatility, and correlation analysis

### Advanced Analytics & Reporting
- **Performance Metrics** - Total return, Sharpe ratio, Calmar ratio
- **Risk Analysis** - VaR, CVaR, downside deviation
- **Trade Analysis** - Win rate, profit factor, trade patterns
- **Market Analysis** - Asset correlations, volatility trends
- **Actionable Recommendations** - Strategy improvement suggestions

## 🏗️ Architecture

### Modular Design
The system is built with a clean, modular architecture:

```
scripts/
├── app.js              # Main application controller
├── config.js           # Configuration and asset definitions
├── market.js           # Market data generation
├── indicators.js       # Technical indicators
├── backtester.js       # Backtesting engine
├── reporting.js        # Analysis and reporting
└── utils.js            # Utility functions
```

### Key Components

#### 1. Market Generator (`market.js`)
- Generates realistic multi-asset price series
- Implements correlation matrices
- Uses Geometric Brownian Motion for price modeling
- Supports customizable market parameters

#### 2. Technical Indicators (`indicators.js`)
- 20+ technical indicators including SMA, EMA, RSI, MACD
- Bollinger Bands, Stochastic, Williams %R
- ATR, CCI, ROC, MFI, Parabolic SAR
- Optimized for performance and accuracy

#### 3. Backtesting Engine (`backtester.js`)
- Strategy execution framework
- Position and risk management
- Trade cost calculation
- Performance metrics computation

#### 4. Reporting System (`reporting.js`)
- Comprehensive strategy analysis
- Risk assessment and recommendations
- Export capabilities (JSON, CSV)
- Visual chart generation

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- No additional dependencies required

### Installation
1. Clone or download the repository
2. Open `SimulatedExchange.html` in your browser
3. The system will automatically initialize

### Basic Usage

#### 1. Select Assets
- Choose from available assets (Bitcoin, Gold, S&P 500, etc.)
- Select multiple assets for portfolio testing
- Assets maintain realistic correlations

#### 2. Generate Market Data
- Set the number of candles (50-10,000)
- Configure seed for reproducible results
- Set initial capital amount

#### 3. Configure Strategy
- Choose from built-in strategies or write custom code
- Adjust strategy parameters
- Save and load strategy configurations

#### 4. Run Backtest
- Execute strategy against market data
- View real-time results and charts
- Analyze performance metrics

#### 5. Review Report
- Comprehensive strategy analysis
- Risk assessment and recommendations
- Export results for further analysis

## 📊 Strategy Development

### Built-in Strategies

#### Moving Average Crossover
```javascript
// Golden cross (fast MA > slow MA) = Buy
// Death cross (fast MA < slow MA) = Sell
```

#### RSI Mean Reversion
```javascript
// RSI < 30 = Oversold (Buy)
// RSI > 70 = Overbought (Sell)
```

#### Bollinger Bands
```javascript
// Price <= Lower Band = Buy
// Price >= Upper Band = Sell
```

### Custom Strategy Development

Write your own strategies in JavaScript:

```javascript
// Example: Simple momentum strategy
const momentum = prices[i] - prices[i-5];
if (momentum > 0 && position <= 0) return 1;  // Buy
if (momentum < 0 && position >= 0) return -1; // Sell
return position; // Hold
```

#### Available Context
- `i` - Current index
- `prices` - Price array
- `position` - Current position (-1, 0, 1)
- `indicators` - Technical indicators library
- `helpers` - Utility functions

## 📈 Performance Metrics

### Return Metrics
- **Total Return** - Overall strategy performance
- **Annualized Return** - Year-over-year growth
- **Sharpe Ratio** - Risk-adjusted returns
- **Sortino Ratio** - Downside risk adjustment

### Risk Metrics
- **Maximum Drawdown** - Largest peak-to-trough decline
- **Volatility** - Price fluctuation measure
- **VaR (95%)** - Value at Risk
- **CVaR (95%)** - Conditional Value at Risk

### Trading Metrics
- **Win Rate** - Percentage of profitable trades
- **Profit Factor** - Gross profit / Gross loss
- **Calmar Ratio** - Return / Maximum drawdown
- **Trade Frequency** - Number of trades per period

## 🔧 Configuration

### Asset Parameters
Each asset has configurable:
- Starting price
- Volatility (σ)
- Drift (μ)
- Color for visualization

### Market Settings
- Number of candles
- Random seed for reproducibility
- Correlation matrix customization
- Time period selection

### Strategy Settings
- Trading fees
- Slippage assumptions
- Initial capital
- Position sizing rules

## 📊 Export & Analysis

### Report Formats
- **JSON Export** - Complete data export
- **CSV Export** - Tabular data format
- **Chart Data** - Visualization-ready datasets

### Analysis Components
- Performance summary
- Risk assessment
- Trading analysis
- Market correlation analysis
- Strategy recommendations

## 🎯 Use Cases

### Individual Traders
- Test trading strategies before live implementation
- Optimize strategy parameters
- Understand risk-return characteristics
- Develop new trading ideas

### Portfolio Managers
- Multi-asset strategy testing
- Correlation analysis
- Risk management assessment
- Performance attribution

### Researchers
- Market microstructure analysis
- Strategy backtesting
- Risk modeling
- Academic research

## 🔒 Security & Safety

### Code Sandboxing
- Custom strategies run in isolated environment
- No access to system resources
- Input validation and sanitization
- Error handling and recovery

### Data Privacy
- All processing happens locally
- No data sent to external servers
- Local storage for user preferences
- Export functionality for data portability

## 🚧 Limitations

### Current Version
- Synthetic market data only
- Single-threaded execution
- Limited to browser environment
- No real-time data feeds

### Future Enhancements
- Real market data integration
- Multi-threading support
- Cloud-based processing
- Advanced machine learning models

## 🤝 Contributing

### Development Guidelines
- Maintain modular architecture
- Follow ES6+ standards
- Include comprehensive testing
- Document all public APIs

### Areas for Improvement
- Additional technical indicators
- More sophisticated market models
- Enhanced visualization options
- Performance optimization

## 📄 License

This project is provided for educational and research purposes. Please ensure compliance with local regulations when using for actual trading decisions.

## ⚠️ Disclaimer

This software is for educational and testing purposes only. It does not constitute investment advice. Always conduct thorough testing and consider professional guidance before implementing trading strategies with real capital.

---

**Built with modern web technologies for professional trading algorithm development and testing.**
