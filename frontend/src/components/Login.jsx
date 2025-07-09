import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const navigate = useNavigate();

  // Handle initial login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else if (res.data.message === '2FA required') {
        setShow2FA(true);
        setPendingEmail(email);
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      // Handle email verification requirement
      if (err.response?.data?.requiresVerification) {
        setError('Please verify your email address before logging in.');
        // Optionally redirect to verification page
        setTimeout(() => {
          navigate('/verify-email', { state: { email } });
        }, 2000);
      } else if (err.response?.data?.accountInactive) {
        setError('Your account is not active. Please contact support.');
      } else if (err.response?.data?.pendingApproval) {
        setError('Your account is pending approval. Please wait for admin approval.');
        // Redirect to pending approval page
        setTimeout(() => {
          navigate('/pending-approval');
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    }
    setLoading(false);
  };

  // Handle 2FA code submission
  const handle2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/2fa/validate`, {
        email: pendingEmail,
        token: twoFACode,
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard');
      } else {
        setError('Invalid 2FA code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || '2FA validation failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: `linear-gradient(rgba(26, 26, 26, 0.85), rgba(26, 26, 26, 0.85)), url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Gold top bar with site name */}
      <div
        style={{ 
          width: '100%', 
          background: '#d4af37', 
          color: '#1a1a1a', 
          padding: '12px 20px', 
          textAlign: 'left', 
          fontWeight: 'bold', 
          fontSize: '1.5rem', 
          letterSpacing: '1px', 
          cursor: 'pointer' 
        }}
        onClick={() => navigate('/')}
      >
        Invest Platform
      </div>
      
      <div className="container mt-5" style={{ maxWidth: 400, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Back Arrow */}
        <div className="mb-4" style={{ textAlign: 'left' }}>
          <span 
            onClick={() => navigate('/')}
            style={{ 
              fontSize: '16px',
              color: '#d4af37',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ← Back to Home
          </span>
        </div>
        
        <div className="card border-0 shadow-lg" style={{ 
          backgroundColor: 'rgba(45, 45, 45, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px'
        }}>
          <div className="card-body p-5">
            <h3 className="mb-4 text-center" style={{ color: '#d4af37', fontWeight: 'bold' }}>Hello! Welcome to login</h3>
            {!show2FA ? (
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label" style={{ color: '#e0e0e0', fontWeight: '500' }}>Account</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Please Enter Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ color: '#e0e0e0', fontWeight: '500' }}>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Please Enter Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                {error && <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.2)', border: '1px solid rgba(220, 53, 69, 0.3)', color: '#ff6b6b' }}>{error}</div>}
                <button type="submit" className="btn w-100 mb-3" disabled={loading} style={{
                  backgroundColor: '#d4af37',
                  borderColor: '#d4af37',
                  color: '#1a1a1a',
                  fontWeight: '600',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <div className="text-end mb-3">
                  <button 
                    type="button" 
                    className="btn btn-link p-0"
                    style={{ textDecoration: 'none', color: '#d4af37' }}
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="text-center">
                  <button 
                    type="button" 
                    className="btn w-100"
                    onClick={() => navigate('/register')}
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#d4af37',
                      color: '#d4af37',
                      fontWeight: '600',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  >
                    Register
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handle2FA}>
                <div className="mb-3">
                  <label className="form-label" style={{ color: '#e0e0e0', fontWeight: '500' }}>2FA Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={twoFACode}
                    onChange={e => setTwoFACode(e.target.value)}
                    required
                    maxLength={6}
                    pattern="\\d{6}"
                    placeholder="Enter 6-digit code"
                    autoFocus
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                {error && <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.2)', border: '1px solid rgba(220, 53, 69, 0.3)', color: '#ff6b6b' }}>{error}</div>}
                <button type="submit" className="btn w-100" disabled={loading} style={{
                  backgroundColor: '#d4af37',
                  borderColor: '#d4af37',
                  color: '#1a1a1a',
                  fontWeight: '600',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  {loading ? 'Verifying...' : 'Verify 2FA'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 