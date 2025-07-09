import React, { useState, useEffect } from 'react';

const SimpleBTCChart = () => {
  const [btcPrice, setBtcPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBTCPrice = async () => {
      try {
        // Using a simple API to get BTC price
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        setBtcPrice(data.bitcoin.usd);
      } catch (error) {
        console.error('Failed to fetch BTC price:', error);
        // Fallback price
        setBtcPrice(45000);
      } finally {
        setLoading(false);
      }
    };

    fetchBTCPrice();
    const interval = setInterval(fetchBTCPrice, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 400 }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h3 className="text-warning mb-2">
          <i className="fab fa-bitcoin me-2"></i>
          Bitcoin Price
        </h3>
        <h2 className="text-success mb-0">
          ${btcPrice ? btcPrice.toLocaleString() : 'N/A'}
        </h2>
        <small className="text-muted">Live price from CoinGecko</small>
      </div>
      
      <div className="text-center">
        <div className="alert alert-info">
          <i className="fas fa-chart-line me-2"></i>
          Advanced chart temporarily unavailable. Please refresh the page to try again.
        </div>
      </div>
    </div>
  );
};

export default SimpleBTCChart; 