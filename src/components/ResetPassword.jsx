import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    console.log('Reset token received:', token);

    // Validate the reset token
    const validateToken = async () => {
      try {
        console.log('Validating token with URL:', `${API_BASE_URL}/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
        await axios.get(`${API_BASE_URL}/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`);
        console.log('Token validation successful');
        setIsValidToken(true);
      } catch (err) {
        console.error('Token validation failed:', err.response?.data || err.message);
        setError('Invalid or expired reset link. Please request a new password reset.');
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting password reset with token:', token);
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token: decodeURIComponent(token),
        password
      });
      console.log('Password reset successful:', res.data);
      setMessage(res.data.message || 'Password reset successfully!');
      setIsSubmitted(true);
    } catch (err) {
      console.error('Password reset failed:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    }
    setLoading(false);
  };

  if (!token) {
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
        <div className="container mt-5" style={{ maxWidth: 400, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="card border-0 shadow-lg" style={{ 
            backgroundColor: 'rgba(45, 45, 45, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <div className="card-body p-5 text-center">
              <h3 className="mb-4" style={{ color: '#d4af37', fontWeight: 'bold' }}>Invalid Reset Link</h3>
              <p style={{ color: '#e0e0e0' }}>{error}</p>
              <button 
                onClick={() => navigate('/forgot-password')}
                className="btn mt-3"
                style={{
                  backgroundColor: '#d4af37',
                  borderColor: '#d4af37',
                  color: '#1a1a1a',
                  fontWeight: '600',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="card border-0 shadow-lg" style={{ 
          backgroundColor: 'rgba(45, 45, 45, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px'
        }}>
          <div className="card-body p-5">
            <h3 className="mb-4 text-center" style={{ color: '#d4af37', fontWeight: 'bold' }}>
              {isSubmitted ? 'Password Reset Successfully!' : 'Reset Your Password'}
            </h3>
            
            {!isSubmitted ? (
              <>
                {!isValidToken ? (
                  <div className="text-center">
                    <p style={{ color: '#e0e0e0' }}>Validating reset link...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-center mb-4" style={{ color: '#e0e0e0' }}>
                      Enter your new password below.
                    </p>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label" style={{ color: '#e0e0e0', fontWeight: '500' }}>New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter new password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          minLength={6}
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
                        <label className="form-label" style={{ color: '#e0e0e0', fontWeight: '500' }}>Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            color: '#e0e0e0',
                            borderRadius: '8px'
                          }}
                        />
                      </div>
                      {error && (
                        <div className="alert alert-danger" style={{ 
                          backgroundColor: 'rgba(220, 53, 69, 0.2)', 
                          border: '1px solid rgba(220, 53, 69, 0.3)', 
                          color: '#ff6b6b' 
                        }}>
                          {error}
                        </div>
                      )}
                      <button 
                        type="submit" 
                        className="btn w-100" 
                        disabled={loading}
                        style={{
                          backgroundColor: '#d4af37',
                          borderColor: '#d4af37',
                          color: '#1a1a1a',
                          fontWeight: '600',
                          borderRadius: '8px',
                          padding: '12px'
                        }}
                      >
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </form>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: '#28a745', marginBottom: '1rem' }}></i>
                  <p style={{ color: '#e0e0e0', fontSize: '1.1rem' }}>
                    {message}
                  </p>
                  <p style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                    You can now log in with your new password.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn w-100"
                  onClick={() => navigate('/login')}
                  style={{
                    backgroundColor: '#d4af37',
                    borderColor: '#d4af37',
                    color: '#1a1a1a',
                    fontWeight: '600',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 