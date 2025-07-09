import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import countries from '../data/countries';
import currencies from '../data/currencies';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1'); // Default to US
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Combine country code with phone number
    const fullPhoneNumber = phoneCountryCode + phone.replace(/^[Ak]/, '');
    
    setLoading(true);
    try {
      console.log('Attempting registration with:', { email, password, country, currency, phone: fullPhoneNumber, firstName, lastName });
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { email, password, country, currency, phone: fullPhoneNumber, firstName, lastName });
      console.log('Registration response:', res.data);
      
      // Navigate to email verification page
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 409) {
        errorMessage = 'An account with this email or phone number already exists.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Please check your input and try again.';
      }
      
      setError(errorMessage);
    }
    setLoading(false);
  };

  // Update phone country code when country changes
  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    
    // Find the phone code for the selected country
    const countryData = countries.find(c => c.code === selectedCountry);
    if (countryData) {
      setPhoneCountryCode(countryData.phoneCode);
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
      
      <div className="container" style={{ maxWidth: 500, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px' }}>
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
        
        <div className="card border-0 shadow" style={{
          backgroundColor: 'rgba(45, 45, 45, 0.95)',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="card-body p-5">
            <h3 className="mb-4 text-center" style={{ color: '#d4af37', fontWeight: 'bold' }}>
              Create an Account
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={30}
                    placeholder="First Name"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={30}
                    placeholder="Last Name"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>Email address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter your email"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#e0e0e0',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm password"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>Country</label>
                  <select 
                    className="form-select" 
                    value={country} 
                    onChange={handleCountryChange} 
                    required
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.code} style={{ backgroundColor: '#2d2d2d', color: '#e0e0e0' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>Currency</label>
                  <select 
                    className="form-select" 
                    value={currency} 
                    onChange={e => setCurrency(e.target.value)} 
                    required
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#e0e0e0',
                      borderRadius: '8px'
                    }}
                  >
                    <option value="">Select Currency</option>
                    {currencies.map(cur => (
                      <option key={cur.code} value={cur.code} style={{ backgroundColor: '#2d2d2d', color: '#e0e0e0' }}>
                        {cur.code} - {cur.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label" style={{ color: '#d4af37', fontWeight: '500' }}>Phone Number</label>
                <div className="row">
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={phoneCountryCode}
                      onChange={e => setPhoneCountryCode(e.target.value)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#e0e0e0',
                        borderRadius: '8px'
                      }}
                    >
                      {countries.map(c => (
                        <option key={c.code} value={c.phoneCode} style={{ backgroundColor: '#2d2d2d', color: '#e0e0e0' }}>
                          {c.name} ({c.phoneCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-8">
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  pattern="[0-9\-\+\s]+"
                  minLength={7}
                  maxLength={20}
                      placeholder="Phone number (without country code)"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: '#e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                  </div>
                </div>
                <small className="text-muted" style={{ color: '#a0a0a0' }}>
                  Full number: {phoneCountryCode}{phone}
                </small>
              </div>
              {error && (
                <div className="alert mb-4" style={{
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  borderColor: '#dc3545',
                  color: '#f8d7da'
                }}>
                  {error}
                </div>
              )}
              <button 
                type="submit" 
                className="btn w-100 py-3" 
                disabled={loading}
                style={{
                  backgroundColor: '#d4af37',
                  borderColor: '#d4af37',
                  color: '#1a1a1a',
                  fontWeight: '600',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <div className="text-center mt-4">
                <p style={{ color: '#e0e0e0' }}>
                  Already have an account?{' '}
                  <a href="/login" style={{ color: '#d4af37', textDecoration: 'none', fontWeight: '500' }}>
                    Sign In
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 