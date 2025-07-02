import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserNavbar } from './Navbar';
import countries from '../data/countries';
import currencies from '../data/currencies';
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

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    currency: '',
    phone: ''
  });
  const navigate = useNavigate();

  // Function to get country name from code
  const getCountryName = (countryCode) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
  };

  // Function to get country code from name
  const getCountryCode = (countryName) => {
    const country = countries.find(c => c.name === countryName);
    return country ? country.code : countryName;
  };

  useEffect(() => {
    const fetchProfile = async () => {
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
        const res = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Defensive type check
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          setUser(res.data);
          // Initialize form data - convert country code to name for form
          setFormData({
            firstName: res.data.firstName || '',
            lastName: res.data.lastName || '',
            country: getCountryName(res.data.country) || '',
            currency: res.data.currency || '',
            phone: res.data.phone || ''
          });
        } else {
          setUser(null);
          setError('Profile data is not an object.');
        }
      } catch (err) {
        setError('Failed to fetch profile');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setShowEditModal(true);
    setUpdateMessage('');
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setUpdateMessage('');
    // Reset form data to current user data - convert country code to name
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      country: getCountryName(user.country) || '',
      currency: user.currency || '',
      phone: user.phone || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateMessage('');

    try {
      const token = getAuthToken();
      // Convert country name back to code for backend
      const submitData = {
        ...formData,
        country: getCountryCode(formData.country)
      };
      
      const res = await axios.put(`${API_BASE_URL}/api/user/profile`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUpdateMessage('Profile updated successfully!');
      setUser(res.data.user);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowEditModal(false);
        setUpdateMessage('');
      }, 2000);
    } catch (err) {
      setUpdateMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#ffffff',
      color: '#333333'
    }}>
      <UserNavbar />
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
                  Profile
                </h2>
                <p className="text-muted">View and manage your account information</p>
              </div>
              <button 
                className="btn d-flex align-items-center gap-2"
                onClick={handleEditClick}
                style={{ 
                  backgroundColor: '#d4af37', 
                  borderColor: '#d4af37',
                  color: '#ffffff',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontWeight: '600'
                }}
              >
                <i className="fas fa-edit" style={{ fontSize: '14px' }}></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger" style={{ borderRadius: '10px' }}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        ) : user ? (
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow" style={{ 
                backgroundColor: '#ffffff',
                borderRadius: '15px'
              }}>
                <div className="card-header bg-transparent border-0 pb-0">
                  <h5 className="mb-0" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                    <i className="fas fa-user me-2"></i>
                    User Details
                  </h5>
                  <small className="text-muted">Your account information and preferences</small>
                </div>
            <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-user me-2" style={{ color: '#d4af37' }}></i>
                          <strong>First Name</strong>
                        </div>
                        <p className="mb-0">{user.firstName}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-user me-2" style={{ color: '#d4af37' }}></i>
                          <strong>Last Name</strong>
                        </div>
                        <p className="mb-0">{user.lastName}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-envelope me-2" style={{ color: '#d4af37' }}></i>
                          <strong>Email Address</strong>
                        </div>
                        <p className="mb-0">{user.email}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-globe me-2" style={{ color: '#d4af37' }}></i>
                          <strong>Country</strong>
                        </div>
                        <p className="mb-0">{getCountryName(user.country)}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-money-bill me-2" style={{ color: '#d4af37' }}></i>
                          <strong>Currency</strong>
                        </div>
                        <p className="mb-0">{user.currency}</p>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-phone me-2" style={{ color: '#d4af37' }}></i>
                          <strong>Phone Number</strong>
                        </div>
                        <p className="mb-0">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                          <i className="fas fa-shield-alt me-2"></i>
                          Account Security
                        </h6>
                        <small className="text-muted">Your account is protected with secure authentication</small>
                      </div>
                      <span className="badge bg-success">
                        <i className="fas fa-check me-1"></i>
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{ borderRadius: '15px' }}>
                <div className="modal-header border-0" style={{ backgroundColor: '#f8f9fa' }}>
                  <h5 className="modal-title" style={{ color: '#d4af37', fontWeight: 'bold' }}>
                    <i className="fas fa-edit me-2"></i>
                    Edit Profile
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {updateMessage && (
                    <div className={`alert ${updateMessage.includes('successfully') ? 'alert-success' : 'alert-danger'}`} style={{ borderRadius: '10px' }}>
                      <i className={`fas ${updateMessage.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                      {updateMessage}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          <i className="fas fa-user me-2" style={{ color: '#d4af37' }}></i>
                          First Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          style={{ borderRadius: '8px' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          <i className="fas fa-user me-2" style={{ color: '#d4af37' }}></i>
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          style={{ borderRadius: '8px' }}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          <i className="fas fa-globe me-2" style={{ color: '#d4af37' }}></i>
                          Country
                        </label>
                        <select
                          className="form-select"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                          style={{ borderRadius: '8px' }}
                        >
                          <option value="">Select Country</option>
                          {countries.map(country => (
                            <option key={country.code} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">
                          <i className="fas fa-money-bill me-2" style={{ color: '#d4af37' }}></i>
                          Currency
                        </label>
                        <select
                          className="form-select"
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          required
                          style={{ borderRadius: '8px' }}
                        >
                          <option value="">Select Currency</option>
                          {currencies.map(currency => (
                            <option key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">
                          <i className="fas fa-phone me-2" style={{ color: '#d4af37' }}></i>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          style={{ borderRadius: '8px' }}
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCloseModal}
                        style={{ borderRadius: '8px' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn"
                        disabled={updateLoading}
                        style={{ 
                          backgroundColor: '#d4af37', 
                          borderColor: '#d4af37',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontWeight: '600'
                        }}
                      >
                        {updateLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 