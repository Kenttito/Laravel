import React, { useEffect, useRef } from 'react';

const TradingViewChart = ({ symbol = 'BTCUSD' }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    // Check if TradingView script is already loaded
    if (window.TradingView) {
      createWidget();
      return;
    }

    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        createWidget();
      }
    };
    script.onerror = () => {
      console.error('Failed to load TradingView script');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup with better error handling
      if (widgetRef.current) {
        try {
          // Check if the widget still exists and has a valid parent
          if (widgetRef.current && widgetRef.current.parentNode) {
            widgetRef.current.remove();
          }
        } catch (error) {
          console.warn('Error removing TradingView widget:', error);
        } finally {
          widgetRef.current = null;
        }
      }
    };
  }, [symbol]);

  const createWidget = () => {
    if (!containerRef.current || !window.TradingView) return;

    try {
      // Clear previous widget with better error handling
      if (widgetRef.current) {
        try {
          if (widgetRef.current.parentNode) {
            widgetRef.current.remove();
          }
        } catch (error) {
          console.warn('Error removing previous widget:', error);
        }
        widgetRef.current = null;
      }

      // Create new widget
      widgetRef.current = new window.TradingView.widget({
        autosize: false,
        symbol: `BINANCE:${symbol}`,
        interval: '60',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        container_id: containerRef.current.id,
        width: '100%',
        height: 500,
        // Add error handling for WebSocket connections
        overrides: {
          "paneProperties.background": "#ffffff",
          "paneProperties.vertGridProperties.color": "#e1e3e6",
          "paneProperties.horzGridProperties.color": "#e1e3e6",
        },
        // Disable some features that might cause WebSocket issues
        studies_overrides: {},
        disabled_features: ["use_localstorage_for_settings"],
        enabled_features: ["study_templates"],
      });
    } catch (error) {
      console.error('Error creating TradingView widget:', error);
    }
  };

  return (
    <div className="my-4">
      <div 
        ref={containerRef}
        id={`tv_chart_${symbol}`} 
        style={{ height: 700, width: '100%' }} 
      />
    </div>
  );
};

export default TradingViewChart; 