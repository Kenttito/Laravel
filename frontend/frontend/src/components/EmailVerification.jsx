import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state or URL params
  React.useEffect(() => {
    const emailFromState = location.state?.email;
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [location]);

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!email || !verificationCode) {
      setError('Please enter both email and verification code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, {
        email,
        code: verificationCode
      });

      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, { email });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(26, 26, 26, 0.9), rgba(26, 26, 26, 0.9)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="container" style={{ maxWidth: 500, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
        <div className="card border-0 shadow" style={{
          backgroundColor: 'rgba(45, 45, 45, 0.95)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="card-body p-5">
            <h3 className="mb-4 text-center" style={{ color: '#d4af37', fontWeight: 'bold' }}>
              Verify Your Email
            </h3>
            
            <div className="alert" style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderColor: '#d4af37',
              color: '#e0e0e0',
              marginBottom: '30px'
            }}>
              <h6 style={{ color: '#d4af37', marginBottom: '10px' }}>Check Your Email</h6>
              <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                We've sent a verification code to your email address. Please enter the code below to verify your account.
              </p>
            </div>

            <form onSubmit={handleVerification}>
              <div className="mb-3">
                <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#e0e0e0',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>Verification Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.toUpperCase())}
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#e0e0e0',
                    borderRadius: '8px',
                    fontSize: '18px',
                    letterSpacing: '2px',
                    textAlign: 'center'
                  }}
                />
                <small style={{ color: '#999', fontSize: '0.8rem' }}>
                  Enter the 6-character code sent to your email
                </small>
              </div>

              {error && (
                <div className="alert alert-danger mb-3" style={{ 
                  backgroundColor: 'rgba(220, 53, 69, 0.2)', 
                  border: '1px solid rgba(220, 53, 69, 0.3)', 
                  color: '#ff6b6b' 
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success mb-3" style={{ 
                  backgroundColor: 'rgba(40, 167, 69, 0.2)', 
                  border: '1px solid rgba(40, 167, 69, 0.3)', 
                  color: '#28a745' 
                }}>
                  {success}
                </div>
              )}

              <div className="d-grid gap-2 mb-3">
                <button
                  type="submit"
                  className="btn"
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
                  {loading ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  style={{
                    color: '#d4af37',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  {resendLoading ? 'Sending...' : "Didn't receive the code? Resend"}
                </button>
              </div>
            </form>

            <hr style={{ borderColor: 'rgba(212, 175, 55, 0.3)', margin: '30px 0' }} />

            <div className="text-center">
              <button
                type="button"
                className="btn"
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#d4af37',
                  color: '#d4af37',
                  fontWeight: '600',
                  borderRadius: '8px',
                  padding: '10px 20px'
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 