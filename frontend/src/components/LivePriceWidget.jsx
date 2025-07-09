import React, { useEffect, useRef, useState } from 'react';

const PAIRS = [
  { label: 'Bitcoin / USD (BTCUSD)', value: 'BINANCE:BTCUSDT' },
  { label: 'Ethereum / USD (ETHUSD)', value: 'BINANCE:ETHUSDT' },
  { label: 'Tether / USD (USDTUSD)', value: 'BINANCE:USDTUSD' },
  { label: 'Ripple / USD (XRPUSD)', value: 'BINANCE:XRPUSDT' },
  { label: 'Euro / USD (EURUSD)', value: 'FX:EURUSD' },
  { label: 'GBP / USD (GBPUSD)', value: 'FX:GBPUSD' },
  { label: 'USD / JPY (USDJPY)', value: 'FX:USDJPY' },
  { label: 'Apple (AAPL)', value: 'NASDAQ:AAPL' },
];

const LivePriceWidget = () => {
  const container = useRef();
  const [selectedPair, setSelectedPair] = useState(PAIRS[0].value);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${selectedPair}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.appendChild(script);
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [selectedPair]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="pair-select" style={{ fontWeight: 'bold', marginRight: 8 }}>Select Pair:</label>
        <select
          id="pair-select"
          value={selectedPair}
          onChange={e => setSelectedPair(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 6 }}
        >
          {PAIRS.map(pair => (
            <option value={pair.value} key={pair.value}>{pair.label}</option>
          ))}
        </select>
      </div>
      <div className="tradingview-widget-container" ref={container} style={{ height: '800px', width: '100%' }}>
        <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
      </div>
    </div>
  );
};

export default LivePriceWidget; 