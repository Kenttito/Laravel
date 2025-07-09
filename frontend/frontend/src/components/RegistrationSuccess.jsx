import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const userEmail = location.state?.email || 'your email';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

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
      
      <div className="container" style={{ maxWidth: 600, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
        <div className="card border-0 shadow" style={{
          backgroundColor: 'rgba(45, 45, 45, 0.95)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="card-body p-5 text-center">
            {/* Success Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#28a745',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 30px',
              fontSize: '40px',
              color: 'white'
            }}>
              ✓
            </div>
            
            <h3 className="mb-4" style={{ color: '#d4af37', fontWeight: 'bold' }}>
              Registration Successful!
            </h3>
            
            <div className="alert" style={{
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              borderColor: '#28a745',
              color: '#e0e0e0',
              marginBottom: '30px'
            }}>
              <h5 style={{ color: '#28a745' }}>Welcome to Invest Platform!</h5>
              <p className="mb-2">Your account has been created successfully.</p>
              <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                Account created for: <strong style={{ color: '#d4af37' }}>{userEmail}</strong>
              </p>
            </div>
            
            <div style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <h6 style={{ color: '#d4af37', marginBottom: '15px' }}>Next Steps:</h6>
              <ul style={{ textAlign: 'left', color: '#e0e0e0', margin: 0, paddingLeft: '20px' }}>
                <li>Check your email for account verification</li>
                <li>Log in to access your dashboard</li>
                <li>Complete your profile setup</li>
                <li>Start your investment journey</li>
              </ul>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#e0e0e0', marginBottom: '10px' }}>
                Redirecting to login page in <strong style={{ color: '#d4af37' }}>{countdown}</strong> seconds...
              </p>
            </div>
            
            <div className="d-flex gap-3 justify-content-center">
              <button 
                className="btn px-4 py-2"
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: '#d4af37',
                  borderColor: '#d4af37',
                  color: '#1a1a1a',
                  fontWeight: '600',
                  borderRadius: '8px'
                }}
              >
                Go to Login
              </button>
              <button 
                className="btn px-4 py-2"
                onClick={() => navigate('/')}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#d4af37',
                  color: '#d4af37',
                  fontWeight: '600',
                  borderRadius: '8px'
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess; 