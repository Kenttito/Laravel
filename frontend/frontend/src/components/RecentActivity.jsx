import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Utility to get the correct token
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

const RecentActivity = ({ activity: propActivity, isStandalone = true }) => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const fetchActivity = async (limit = displayLimit) => {
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
      const res = await axios.get(`${API_BASE_URL}/api/user/activity?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Defensive check for both array and object formats
      if (Array.isArray(res.data)) {
        setActivity(res.data);
      } else if (res.data && typeof res.data === 'object' && Array.isArray(res.data.activity)) {
        setActivity(res.data.activity);
      } else {
        setActivity([]);
        setError('Activity data is not in expected format.');
      }
      
      console.log('First activity item:', res.data.activity ? res.data.activity[0] : res.data[0]);
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (newLimit) => {
    setDisplayLimit(newLimit);
    setShowDropdown(false);
    fetchActivity(newLimit);
  };

  // Use prop activity if provided (for Dashboard use)
  const displayActivity = propActivity || activity;

  useEffect(() => {
    fetchActivity();
    
    // Auto-refresh every 30 seconds only for standalone page
    if (isStandalone) {
      const interval = setInterval(() => fetchActivity(), 30000);
      return () => clearInterval(interval);
    }
  }, [displayLimit]);

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

  const getStatusBadge = (status) => {
    console.log('Creating status badge for:', status, 'Type:', typeof status);
    const cleanStatus = status?.toLowerCase() || '';
    console.log('Clean status:', cleanStatus);
    
    switch (cleanStatus) {
      case 'completed':
      case 'approved':
        return <span className="badge bg-success">Completed</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'failed':
      case 'rejected':
        return <span className="badge bg-danger">Failed</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // If used as component in Dashboard, render table only
  if (!isStandalone) {
    return (
      <table className="table table-bordered align-middle mb-0">
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {(!displayActivity || !Array.isArray(displayActivity) || displayActivity.length === 0) ? (
            <tr><td colSpan={5} className="text-center">No recent activity found.</td></tr>
          ) : displayActivity.map((tx, idx) => (
            <tr key={idx}>
              <td>{tx.type}</td>
              <td>{tx.amount}</td>
              <td>{tx.currency}</td>
              <td>{getStatusBadge(tx.status)}</td>
              <td>{tx.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Standalone page render
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
                  Recent Activity
                </h2>
                <p className="text-muted">View your transaction history and account activity</p>
              </div>
              <div className="dropdown">
                <button 
                  className="btn dropdown-toggle" 
                  type="button" 
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ 
                    backgroundColor: '#d4af37', 
                    borderColor: '#d4af37',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontWeight: '600'
                  }}
                >
                  <i className="fas fa-filter me-2"></i>
                  Show {displayLimit} items
                </button>
                {showDropdown && (
                  <ul className="dropdown-menu show" style={{ 
                    display: 'block',
                    borderRadius: '10px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}>
                    <li><button className="dropdown-item" onClick={() => handleLimitChange(5)}>Show 5 items</button></li>
                    <li><button className="dropdown-item" onClick={() => handleLimitChange(10)}>Show 10 items</button></li>
                    <li><button className="dropdown-item" onClick={() => handleLimitChange(20)}>Show 20 items</button></li>
                    <li><button className="dropdown-item" onClick={() => handleLimitChange(50)}>Show 50 items</button></li>
                    <li><button className="dropdown-item" onClick={() => handleLimitChange(100)}>Show 100 items</button></li>
                    <li><button className="dropdown-item" onClick={() => handleLimitChange(200)}>Show 200 items</button></li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading activity...</p>
          </div>
        )}
        
        {error && (
          <div className="alert alert-danger" style={{ borderRadius: '10px' }}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="card border-0 shadow" style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '15px'
          }}>
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="mb-0" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                <i className="fas fa-history me-2"></i>
                Transaction History
              </h5>
              <small className="text-muted">Showing {displayActivity?.length || 0} of your recent transactions</small>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered align-middle mb-0">
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>Type</th>
                    <th style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>Amount</th>
                    <th style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>Currency</th>
                    <th style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>Status</th>
                    <th style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(!displayActivity || !Array.isArray(displayActivity) || displayActivity.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <i className="fas fa-inbox fa-2x text-muted mb-3 d-block"></i>
                        <p className="text-muted mb-0">No recent activity found.</p>
                        <small className="text-muted">Your transaction history will appear here once you make deposits or withdrawals.</small>
                      </td>
                    </tr>
                  ) : displayActivity.map((tx, idx) => (
                    <tr key={idx} style={{ borderBottom: idx === displayActivity.length - 1 ? 'none' : '1px solid #dee2e6' }}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`fas ${tx.type === 'Deposit' ? 'fa-arrow-up text-success' : 'fa-arrow-down text-danger'} me-2`}></i>
                          <strong>{tx.type}</strong>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold">{tx.amount}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">{tx.currency}</span>
                      </td>
                      <td>{getStatusBadge(tx.status)}</td>
                      <td>
                        <small className="text-muted">{tx.date}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity; 