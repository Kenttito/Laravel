import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message || 'Password reset link sent to your email!');
      setIsSubmitted(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Email address not found. Please check your email or register a new account.');
      } else {
        setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
      }
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
            onClick={() => navigate('/login')}
            style={{ 
              fontSize: '16px',
              color: '#d4af37',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ← Back to Login
          </span>
        </div>
        
        <div className="card border-0 shadow-lg" style={{ 
          backgroundColor: 'rgba(45, 45, 45, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px'
        }}>
          <div className="card-body p-5">
            <h3 className="mb-4 text-center" style={{ color: '#d4af37', fontWeight: 'bold' }}>
              {isSubmitted ? 'Check Your Email' : 'Forgot Password'}
            </h3>
            
            {!isSubmitted ? (
              <>
                <p className="text-center mb-4" style={{ color: '#e0e0e0' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label" style={{ color: '#e0e0e0', fontWeight: '500' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email address"
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
                    className="btn w-100 mb-3" 
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
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <i className="fas fa-envelope" style={{ fontSize: '3rem', color: '#d4af37', marginBottom: '1rem' }}></i>
                  <p style={{ color: '#e0e0e0', fontSize: '1.1rem' }}>
                    {message}
                  </p>
                  <p style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                    Please check your email inbox and follow the instructions to reset your password.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn w-100 mb-3"
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
                  Back to Login
                </button>
                <button 
                  type="button" 
                  className="btn w-100"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                    setMessage('');
                    setError('');
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: '#d4af37',
                    color: '#d4af37',
                    fontWeight: '600',
                    borderRadius: '8px',
                    padding: '12px'
                  }}
                >
                  Send Another Email
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 