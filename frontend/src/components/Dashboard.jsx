import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserNavbar } from './Navbar';
import TradingViewChart from './TradingViewChart';
import ErrorBoundary from './ErrorBoundary';
import SimpleBTCChart from './SimpleBTCChart';
import RecentActivity from './RecentActivity';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Check if user is being impersonated by admin
const isImpersonated = () => {
  const token = localStorage.getItem('impersonationToken');
  const originalAdminToken = localStorage.getItem('originalAdminToken');
  return token && originalAdminToken;
};

const handleCopy = (trader) => {
  alert(`You are now copying ${trader.name}'s most recent trade!`);
};

// Utility to get the correct token (impersonation/user)
const getAuthToken = () => localStorage.getItem('impersonationToken') || localStorage.getItem('token');

// Add axios interceptor for global 401 handling (at the top of the file, after imports):
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('impersonationToken');
      localStorage.removeItem('originalAdminToken');
      localStorage.removeItem('impersonatedUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const Dashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [demoAccount, setDemoAccount] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState('BTCUSDT');
  const [assetPrice, setAssetPrice] = useState(null);
  const [demoAmount, setDemoAmount] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [traders, setTraders] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const wsRef = useRef(null);
  const navigate = useNavigate();
  const [marketTrades, setMarketTrades] = useState([]);
  const marketWsRef = useRef(null);

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (token) {
        try {
          const payload = jwtDecode(token);
          console.log('Decoded token payload:', payload);
        } catch (e) {
          console.warn('Failed to decode token:', e);
        }
      }
      // Fetch wallet data
      const walletRes = await axios.get(`${API_BASE_URL}/api/user/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Defensive type check
      if (walletRes.data && typeof walletRes.data === 'object' && !Array.isArray(walletRes.data)) {
        setWallet(walletRes.data);
      } else {
        setWallet(null);
        setError('Wallet data is not an object.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('impersonationToken');
        localStorage.removeItem('originalAdminToken');
        localStorage.removeItem('impersonatedUser');
        navigate('/login');
      } else {
        setError('Failed to fetch dashboard data');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Fetch initial trader signals
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/trader-signals/recent`)
      .then(res => res.json())
      .then(data => setTraders(data));
  }, []);

  // Subscribe to WebSocket for real-time updates
  useEffect(() => {
    wsRef.current = new window.WebSocket('ws://localhost:5001/ws/trader-signals');
    wsRef.current.onmessage = (event) => {
      const newSignal = JSON.parse(event.data);
      setTraders(prev => {
        const idx = prev.findIndex(t => t.name === newSignal.name);
        if (idx !== -1) {
          // Update existing trader
          const updated = [...prev];
          updated[idx] = { ...updated[idx], signal: newSignal.signal };
          return updated;
        } else {
          // Add new trader
          return [...prev, newSignal];
        }
      });
    };
    return () => wsRef.current && wsRef.current.close();
  }, []);

  // Subscribe to Binance live trades WebSocket
  useEffect(() => {
    marketWsRef.current = new window.WebSocket('ws://localhost:5001/ws/binance-trades');
    marketWsRef.current.onmessage = (event) => {
      const trade = JSON.parse(event.data);
      setMarketTrades(prev => {
        const updated = [trade, ...prev];
        return updated.slice(0, 10); // Keep only the 10 most recent trades
      });
    };
    return () => marketWsRef.current && marketWsRef.current.close();
  }, []);

  // Fetch demo account on load
  useEffect(() => {
    const token = localStorage.getItem('impersonationToken') || localStorage.getItem('token');
    if (!token) return;
    const fetchDemoAccount = async () => {
      try {
        setDemoLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/demo/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDemoAccount(res.data);
      } catch (err) {
        setDemoError('Failed to load demo account');
      } finally {
        setDemoLoading(false);
      }
    };
    fetchDemoAccount();
  }, [token]);

  // Fetch asset price for selected asset
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        let url = '';
        if (selectedAsset === 'BTCUSDT') url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
        else if (selectedAsset === 'ETHUSDT') url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
        else if (selectedAsset === 'BNBUSDT') url = 'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd';
        if (!url) return setAssetPrice(null);
        const res = await fetch(url);
        const data = await res.json();
        if (selectedAsset === 'BTCUSDT') setAssetPrice(data.bitcoin.usd);
        else if (selectedAsset === 'ETHUSDT') setAssetPrice(data.ethereum.usd);
        else if (selectedAsset === 'BNBUSDT') setAssetPrice(data.binancecoin.usd);
      } catch (e) {
        setAssetPrice(null);
      }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'pending':
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 'approved':
        return <span className="badge bg-info">Approved</span>;
      case 'declined':
        return <span className="badge bg-danger">Declined</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const handleDemoTrade = async (type) => {
    setDemoError('');
    if (!assetPrice) return setDemoError('Asset price unavailable.');
    const amt = parseFloat(demoAmount);
    if (isNaN(amt) || amt <= 0) return setDemoError('Enter a valid amount.');
    setDemoLoading(true);
    try {
      const token = localStorage.getItem('impersonationToken') || localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/demo/trade`, {
        asset: selectedAsset,
        type,
        amount: amt,
        price: assetPrice,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDemoAccount(res.data);
      setDemoAmount('');
    } catch (err) {
      setDemoError(err.response?.data?.message || 'Trade failed');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDemoReset = async () => {
    setDemoLoading(true);
    setDemoError('');
    try {
      const token = localStorage.getItem('impersonationToken') || localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/demo/reset`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDemoAccount(res.data);
      setDemoAmount('');
    } catch (err) {
      setDemoError('Failed to reset demo account');
    } finally {
      setDemoLoading(false);
    }
  };

  const getHolding = (asset) => {
    if (!demoAccount) return 0;
    const h = demoAccount.holdings.find(h => h.asset === asset);
    return h ? h.amount : 0;
  };

  const totalPnL = demoAccount ? demoAccount.trades.reduce((sum, t) => sum + (t.pnl || 0), 0) : 0;

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: '#ffffff',
        color: '#333333'
      }}>
        <UserNavbar />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: '#ffffff',
        color: '#333333'
      }}>
        <UserNavbar />
        <div className="container py-5">
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#ffffff',
      color: '#333333'
    }}>
      <UserNavbar />
      
      {/* Impersonation Banner */}
      {isImpersonated() && (
        <div className="alert alert-warning alert-dismissible fade show m-3" role="alert" style={{ borderRadius: '10px' }}>
          <div className="d-flex align-items-center">
            <i className="fas fa-user-shield me-2"></i>
            <div className="flex-grow-1">
              <strong>Admin Impersonation Mode:</strong> You are currently viewing this account as an administrator.
              <br />
              <small className="text-muted">
                User: {JSON.parse(localStorage.getItem('impersonatedUser') || '{}').email}
              </small>
            </div>
            <button 
              type="button" 
              className="btn btn-outline-warning btn-sm ms-3"
              onClick={() => {
                // Restore admin token and remove impersonation data
                localStorage.setItem('token', localStorage.getItem('originalAdminToken'));
                localStorage.removeItem('impersonationToken');
                localStorage.removeItem('originalAdminToken');
                localStorage.removeItem('impersonatedUser');
                window.location.href = '/admin/dashboard';
              }}
            >
              <i className="fas fa-arrow-left me-1"></i>
              Return to Admin
            </button>
          </div>
        </div>
      )}
      
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
            <h2 className="mb-0" style={{ color: '#d4af37', fontWeight: 'bold' }}>
              Dashboard
            </h2>
            <p className="text-muted">Welcome to your investment dashboard</p>
              </div>
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                style={{ 
                  backgroundColor: '#d4af37', 
                  borderColor: '#d4af37',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontWeight: '600'
                }}
                onClick={() => navigate('/deposit')}
              >
                <i className="fas fa-plus"></i>
                Deposit
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow" style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '15px'
            }}>
              <div className="card-body text-center">
                <h6 className="card-title text-muted mb-2">Total Balance</h6>
                <h3 className="mb-0" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                  {wallet ? formatCurrency(wallet.balance, wallet.currency) : '$0.00'}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow" style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '15px'
            }}>
              <div className="card-body text-center">
                <h6 className="card-title text-muted mb-2">Amount Invested</h6>
                <h3 className="mb-0" style={{ color: '#28a745', fontWeight: 'bold' }}>
                  {wallet ? formatCurrency(wallet.invested, wallet.currency) : '$0.00'}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow" style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '15px'
            }}>
              <div className="card-body text-center">
                <h6 className="card-title text-muted mb-2">Total Earnings</h6>
                <h3 className="mb-0" style={{ color: '#17a2b8', fontWeight: 'bold' }}>
                  {wallet ? formatCurrency(wallet.earnings, wallet.currency) : '$0.00'}
                </h3>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow" style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '15px'
            }}>
              <div className="card-body text-center">
                <h6 className="card-title text-muted mb-2">Total Withdrawals</h6>
                <h3 className="mb-0" style={{ color: '#dc3545', fontWeight: 'bold' }}>
                  {wallet ? formatCurrency(wallet.totalWithdrawals, wallet.currency) : '$0.00'}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Live BTC Trading Chart */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow" style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '15px'
            }}>
              <div className="card-header bg-transparent border-0 pb-0">
                <div className="d-flex align-items-center">
                  <i className="fab fa-bitcoin me-2" style={{ color: '#d4af37', fontSize: '1.5rem' }}></i>
                  <div>
                    <h5 className="mb-0" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                      Live Bitcoin (BTC) Chart
                    </h5>
                    <small className="text-muted">Real-time price movements and trading data</small>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <ErrorBoundary>
                  <div style={{ height: '500px' }}>
                    <TradingViewChart symbol="BTCUSD" />
                  </div>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>

        {/* Copy Trader Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-transparent border-0 pb-0">
                <h5 className="mb-0" style={{ color: '#007bff', fontWeight: 'bold' }}>
                  Copy Trader
                </h5>
                <small className="text-muted">Automatically copy the trades of top investors. Choose a trader to follow and your account will mirror their trades in real time.</small>
              </div>
              <div className="card-body">
                <table className="table table-bordered align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Trader</th>
                      <th>ROI</th>
                      <th>Signal</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(traders) ? traders.map((trader, idx) => (
                      <tr key={idx}>
                        <td><strong>{trader.name}</strong></td>
                        <td className="text-success">{trader.roi}</td>
                        <td>
                          <span className={`badge ${trader.signal.action === 'Buy' ? 'bg-success' : 'bg-danger'} me-2`}>
                            {trader.signal.action}
                          </span>
                          {trader.signal.symbol} @ {trader.signal.price} <br />
                          <small className="text-muted">{trader.signal.time}</small>
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => handleCopy(trader)}>
                            Copy
                          </button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={4} className="text-center">Loading trader signals...</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Trading Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-transparent border-0 pb-0">
                <h5 className="mb-0" style={{ color: '#28a745', fontWeight: 'bold' }}>
                  Demo Trading
                </h5>
                <small className="text-muted">Practice trading with virtual funds. No risk, just learning!</small>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="alert alert-info mb-2">
                      <strong>Demo Balance:</strong> ${demoAccount ? demoAccount.balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '...'}<br/>
                      <strong>Holdings:</strong> {getHolding(selectedAsset)} {selectedAsset.replace('USDT','')}
                    </div>
                    <div className="mb-2">
                      <strong>Asset:</strong> 
                      <select className="form-select d-inline w-auto ms-2" value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)}>
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="BNBUSDT">BNB/USDT</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <strong>Price:</strong> {assetPrice ? `$${assetPrice.toLocaleString()}` : 'Loading...'}
                    </div>
                    <input
                      type="number"
                      className="form-control mb-2"
                      placeholder={`Amount (${selectedAsset.replace('USDT','')})`}
                      value={demoAmount}
                      onChange={e => setDemoAmount(e.target.value)}
                      min="0"
                      step="any"
                      disabled={demoLoading}
                    />
                    <div className="d-flex gap-2">
                      <button className="btn btn-success w-50" onClick={() => handleDemoTrade('Buy')} disabled={!assetPrice || demoLoading}>Buy</button>
                      <button className="btn btn-danger w-50" onClick={() => handleDemoTrade('Sell')} disabled={!assetPrice || demoLoading}>Sell</button>
                    </div>
                    <button className="btn btn-secondary w-100 mt-2" onClick={handleDemoReset} disabled={demoLoading}>Reset Demo Account</button>
                    {demoError && <div className="alert alert-danger mt-2 mb-0 py-1">{demoError}</div>}
                    <div className="mt-2"><strong>Total P&L:</strong> <span className={totalPnL >= 0 ? 'text-success' : 'text-danger'}>{totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT</span></div>
                  </div>
                  <div className="col-md-8">
                    <h6>Trade History</h6>
                    {!demoAccount || demoAccount.trades.length === 0 ? (
                      <div className="alert alert-secondary mb-0">No demo trades yet. Try buying or selling above!</div>
                    ) : (
                      <table className="table table-sm table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Asset</th>
                            <th>Amount</th>
                            <th>Price (USD)</th>
                            <th>P&L</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {demoAccount.trades.map((trade, idx) => (
                            <tr key={idx}>
                              <td><span className={`badge ${trade.type === 'Buy' ? 'bg-success' : 'bg-danger'}`}>{trade.type}</span></td>
                              <td>{trade.asset.replace('USDT','')}</td>
                              <td>{trade.amount}</td>
                              <td>${trade.price.toLocaleString()}</td>
                              <td className={trade.pnl >= 0 ? 'text-success' : 'text-danger'}>{trade.pnl >= 0 ? '+' : ''}{(trade.pnl || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                              <td>{new Date(trade.time).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-transparent border-0 pb-0">
                <h5 className="mb-0" style={{ color: '#6c757d', fontWeight: 'bold' }}>
                  Recent Activity
                </h5>
              </div>
              <div className="card-body p-0">
                <RecentActivity isStandalone={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 