import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode';

const CURRENCIES = [
  { label: 'USD', value: 'USD', type: 'fiat' },
  { label: 'Bitcoin (BTC)', value: 'BTC', type: 'crypto' },
  { label: 'Ethereum (ETH)', value: 'ETH', type: 'crypto' },
  { label: 'USDT', value: 'USDT', type: 'crypto' },
  { label: 'Ripple (XRP)', value: 'XRP', type: 'crypto' },
];

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Utility to get the correct token
const getAuthToken = () => localStorage.getItem('impersonationToken') || localStorage.getItem('token');

// Add axios interceptor for global 401 handling (register only once)
if (!window.__axios401InterceptorRegistered) {
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
  window.__axios401InterceptorRegistered = true;
}

const Withdrawal = () => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USD');
  const [withdrawType, setWithdrawType] = useState('fiat');
  const [withdrawMsg, setWithdrawMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiveAddress, setReceiveAddress] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Withdraw handler
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawMsg('');
    setLoading(true);
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
      const withdrawData = { 
        amount: withdrawAmount, 
        currency: withdrawCurrency, 
        type: withdrawType 
      };
      
      // Add receive address for crypto withdrawals
      if (withdrawType === 'crypto' && receiveAddress) {
        withdrawData.receiveAddress = receiveAddress;
      }
      
      const res = await axios.post(`${API_BASE_URL}/api/transaction/withdraw`, withdrawData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      // Defensive type check
      if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        setWithdrawMsg(res.data.message);
        setWithdrawAmount('');
        setReceiveAddress('');
      } else {
        setWithdrawMsg('Withdrawal response not in expected format.');
      }
    } catch (err) {
      setWithdrawMsg(err.response?.data?.message || 'Withdrawal failed');
    }
    setLoading(false);
  };

  // Get address placeholder based on selected crypto
  const getAddressPlaceholder = () => {
    switch (withdrawCurrency) {
      case 'BTC':
        return 'Enter your Bitcoin (BTC) receive address';
      case 'ETH':
        return 'Enter your Ethereum (ETH) receive address';
      case 'USDT':
        return 'Enter your USDT receive address';
      case 'XRP':
        return 'Enter your Ripple (XRP) receive address';
      default:
        return 'Enter receive address';
    }
  };

  // Get address label based on selected crypto
  const getAddressLabel = () => {
    switch (withdrawCurrency) {
      case 'BTC':
        return 'Bitcoin (BTC) Address';
      case 'ETH':
        return 'Ethereum (ETH) Address';
      case 'USDT':
        return 'USDT Address';
      case 'XRP':
        return 'Ripple (XRP) Address';
      default:
        return 'Receive Address';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#ffffff',
      color: '#333333'
    }}>
      <Navbar />
      <div className="container py-5">
        {/* Back Arrow */}
        <div className="mb-4">
          <button 
            className="btn d-flex align-items-center gap-2"
            onClick={() => navigate('/dashboard')}
            style={{ 
              backgroundColor: '#d4af37', 
              borderColor: '#d4af37',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 16px',
              fontWeight: '600'
            }}
          >
            <i className="fas fa-chevron-left" style={{ fontSize: '14px' }}></i>
            Back to Dashboard
          </button>
        </div>
        
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                  Withdrawal
                </h2>
                <p className="text-muted">Withdraw funds from your investment account</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow" style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '15px'
            }}>
              <div className="card-body">
                <h5 className="card-title mb-4" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                  <i className="fas fa-arrow-down me-2"></i>
                  Withdraw Funds
                </h5>
                <form onSubmit={handleWithdraw}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Type</label>
                    <select 
                      className="form-select" 
                      value={withdrawType} 
                      onChange={e => setWithdrawType(e.target.value)}
                        style={{ borderRadius: '8px' }}
                    >
                      <option value="fiat">Fiat</option>
                      <option value="crypto">Crypto</option>
                    </select>
                  </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Currency</label>
                    <select 
                      className="form-select" 
                      value={withdrawCurrency} 
                      onChange={e => setWithdrawCurrency(e.target.value)}
                        style={{ borderRadius: '8px' }}
                    >
                      {CURRENCIES.filter(c => c.type === withdrawType).map(c => (
                        <option value={c.value} key={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                    
                    <div className="col-12">
                      <label className="form-label fw-bold">Amount</label>
                    <input 
                      type="number" 
                      className="form-control" 
                        placeholder="Enter withdrawal amount" 
                      value={withdrawAmount} 
                      onChange={e => setWithdrawAmount(e.target.value)} 
                      min={1} 
                      required 
                        style={{ borderRadius: '8px' }}
                    />
                  </div>
                    
                  {withdrawType === 'crypto' && (
                      <div className="col-12">
                        <label className="form-label fw-bold">
                          <i className="fab fa-bitcoin me-2" style={{ color: '#d4af37' }}></i>
                          {getAddressLabel()}
                        </label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder={getAddressPlaceholder()} 
                        value={receiveAddress} 
                        onChange={e => setReceiveAddress(e.target.value)} 
                        required
                          style={{ borderRadius: '8px' }}
                      />
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Please ensure the address is correct. Incorrect addresses may result in permanent loss of funds.
                        </small>
                    </div>
                  )}
                    
                    <div className="col-12">
                    <button 
                        className="btn w-100" 
                      type="submit"
                      disabled={loading}
                        style={{ 
                          backgroundColor: '#d4af37', 
                          borderColor: '#d4af37',
                          color: '#ffffff',
                          borderRadius: '10px',
                          padding: '12px 20px',
                          fontWeight: '600'
                        }}
                    >
                        {loading ? (
                          <>
                            <i className="fas fa-spinner fa-spin me-2"></i>
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-arrow-down me-2"></i>
                            Withdraw Funds
                          </>
                        )}
                    </button>
                    </div>
                  </div>
                </form>
                
                {withdrawMsg && (
                  <div className={`alert mt-3 ${withdrawMsg.includes('failed') ? 'alert-danger' : 'alert-success'}`} style={{ borderRadius: '10px' }}>
                    <i className={`fas ${withdrawMsg.includes('failed') ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2`}></i>
                    {withdrawMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawal; 