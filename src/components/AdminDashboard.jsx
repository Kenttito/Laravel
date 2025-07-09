import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Utility to get the correct token (impersonation/admin/user)
const getAuthToken = () => localStorage.getItem('impersonationToken') || localStorage.getItem('token');

// Utility to get admin token for admin operations (never use impersonation token)
const getAdminToken = () => localStorage.getItem('token');

// Utility to format amounts without trailing zeros
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '';
  const num = Number(amount);
  if (isNaN(num)) return amount;
  return num.toLocaleString(undefined, { maximumFractionDigits: 8 });
};

const AdminDashboard = () => {
  console.log('AdminDashboard component rendering');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [depositUser, setDepositUser] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositForm, setDepositForm] = useState({ amount: '', currency: 'USD', type: 'fiat' });
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [pendingWithdrawLoading, setPendingWithdrawLoading] = useState(false);
  const [depositStatType, setDepositStatType] = useState('balance');
  const [allDeposits, setAllDeposits] = useState([]);
  const [allDepositsLoading, setAllDepositsLoading] = useState(false);
  const [deductUser, setDeductUser] = useState(null);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [deductForm, setDeductForm] = useState({ amount: '', currency: 'USD', type: 'fiat' });
  const [deductStatType, setDeductStatType] = useState('balance');
  const [depositSortFilter, setDepositSortFilter] = useState('all');
  const [depositDisplayCount, setDepositDisplayCount] = useState(10);
  const navigate = useNavigate();
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const adminDropdownRef = useRef(null);

  // Crypto Address Management
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [cryptoForm, setCryptoForm] = useState({
    BTC: '',
    ETH: '',
    USDT: '',
    XRP: ''
  });
  const [cryptoFiles, setCryptoFiles] = useState({
    BTC_QR: null,
    ETH_QR: null,
    USDT_QR: null,
    XRP_QR: null
  });
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoMsg, setCryptoMsg] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setShowAdminDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Pending Withdrawals (Admin)
  const fetchPendingWithdrawals = async () => {
    setPendingWithdrawLoading(true);
    try {
      const token = getAdminToken();
      const res = await axios.get(`${API_BASE_URL}/api/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter for pending withdrawals only
      const pendingWithdrawals = res.data.filter(withdrawal => withdrawal.status === 'pending');
      setPendingWithdrawals(pendingWithdrawals);
    } catch (err) {
      setPendingWithdrawals([]);
    }
    setPendingWithdrawLoading(false);
  };

  useEffect(() => {
    console.log('AdminDashboard component mounted');
    // Check admin authentication
    const token = getAdminToken();
    console.log('Token found:', !!token);
    if (!token) {
      console.log('No token found, redirecting to admin login');
      navigate('/admin');
      return;
    }
    let payload;
    try {
      payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
    } catch {
      console.log('Failed to parse token, redirecting to admin login');
      localStorage.removeItem('token');
      navigate('/admin');
      return;
    }
    if (payload.role !== 'admin') {
      console.log('User is not admin, redirecting to admin login');
      localStorage.removeItem('token');
      navigate('/admin');
      return;
    }
    console.log('Admin authentication successful, fetching data');
    // Fetch users
    fetchUsers();
    fetchAllDeposits();
    fetchPendingWithdrawals();
    fetchCryptoAddresses();
    // eslint-disable-next-line
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAdminToken();
      if (token) {
        try {
          const payload = jwtDecode(token);
          console.log('Decoded token payload:', payload);
        } catch (e) {
          console.warn('Failed to decode token:', e);
        }
      }
      const res = await axios.get(`${API_BASE_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Defensive check
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
        setError('Users data is not an array.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  // Edit
  const openEditModal = (user) => {
    setEditUser(user);
    setForm({ ...user });
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUser(null);
    setForm({});
  };
  const handleEditChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const submitEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = getAdminToken();
      await axios.put(`${API_BASE_URL}/api/user/${editUser.id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeEditModal();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
    setActionLoading(false);
  };

  // Delete
  const openDeleteModal = (userId) => {
    console.log('Opening delete modal for user ID:', userId);
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteUserId(null);
  };
  const confirmDelete = async () => {
    setActionLoading(true);
    try {
      console.log('Attempting to delete user:', deleteUserId);
      console.log('Delete URL:', `${API_BASE_URL}/api/user/${deleteUserId}`);
      const token = getAdminToken();
      const response = await axios.delete(`${API_BASE_URL}/api/user/${deleteUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response:', response.data);
      closeDeleteModal();
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
    setActionLoading(false);
  };

  // Admin Login as User
  const handleLoginAsUser = async (user) => {
    if (!window.confirm(`Are you sure you want to login as ${user.firstName} ${user.lastName} (${user.email})?`)) {
      return;
    }
    
    setActionLoading(true);
    try {
      const token = getAuthToken();
      const res = await axios.post(`${API_BASE_URL}/api/auth/admin/login-as-user`, 
        { userId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.token) {
        // Store the impersonation token
        localStorage.setItem('impersonationToken', res.data.token);
        localStorage.setItem('originalAdminToken', token);
        localStorage.setItem('impersonatedUser', JSON.stringify(res.data.user));
        
        // Navigate to user dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to login as user');
    }
    setActionLoading(false);
  };

  // All Deposits (Admin)
  const fetchAllDeposits = async () => {
    setAllDepositsLoading(true);
    try {
      const token = getAdminToken();
      const res = await axios.get(`${API_BASE_URL}/api/admin/deposits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Backend now handles sorting with pending deposits first
      setAllDeposits(res.data);
    } catch (err) {
      setAllDeposits([]);
    }
    setAllDepositsLoading(false);
  };

  // Filter deposits based on selected status
  const getFilteredDeposits = () => {
    if (!Array.isArray(allDeposits)) {
      console.error('allDeposits is not an array:', allDeposits);
      return [];
    }
    if (depositSortFilter === 'all') {
      return allDeposits;
    }
    return allDeposits.filter(deposit => deposit.status === depositSortFilter);
  };

  // Get count of pending deposits
  const getPendingDepositsCount = () => {
    if (!Array.isArray(allDeposits)) {
      console.error('allDeposits is not an array:', allDeposits);
      return 0;
    }
    return allDeposits.filter(deposit => deposit.status === 'pending').length;
  };

  // Get paginated deposits based on display count
  const getPaginatedDeposits = () => {
    const filtered = getFilteredDeposits();
    return filtered.slice(0, depositDisplayCount);
  };

  // Clear All Deposits (Admin)
  const clearAllDeposits = async () => {
    setActionLoading(true);
    try {
      const token = getAdminToken();
      await axios.delete(`${API_BASE_URL}/api/transaction/deposits/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllDeposits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear deposits');
    }
    setActionLoading(false);
  };

  const handleApproveDeposit = async (id) => {
    setActionLoading(true);
    try {
      const token = getAdminToken();
      await axios.post(`${API_BASE_URL}/api/admin/deposit/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllDeposits();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve deposit');
    }
    setActionLoading(false);
  };

  const handleDeclineDeposit = async (id) => {
    setActionLoading(true);
    try {
      const token = getAdminToken();
      await axios.post(`${API_BASE_URL}/api/admin/deposit/decline/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllDeposits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline deposit');
    }
    setActionLoading(false);
  };

  // Admin manual deposit
  const openDepositModal = (user) => {
    setDepositUser(user);
    setDepositForm({ amount: '', currency: 'USD', type: 'fiat' });
    setDepositStatType('balance');
    setShowDepositModal(true);
  };
  const closeDepositModal = () => {
    setShowDepositModal(false);
    setDepositUser(null);
    setDepositForm({ amount: '', currency: 'USD', type: 'fiat' });
  };
  const handleDepositChange = (e) => {
    setDepositForm({ ...depositForm, [e.target.name]: e.target.value });
  };
  const submitDeposit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = getAdminToken();
      await axios.post(`${API_BASE_URL}/api/transaction/admin/deposit`, {
        userId: depositUser.id,
        amount: depositForm.amount,
        currency: depositForm.currency,
        type: depositForm.type,
        statType: depositStatType,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeDepositModal();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to manage funds');
    }
    setActionLoading(false);
  };

  const handleApproveWithdrawal = async (id) => {
    setActionLoading(true);
    try {
      const token = getAdminToken();
      await axios.post(`${API_BASE_URL}/api/admin/withdrawal/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Withdrawal approved successfully!');
      fetchPendingWithdrawals();
      fetchUsers(); // Refresh user data in case their balance changed
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve withdrawal');
    }
    setActionLoading(false);
  };

  const handleDeclineWithdrawal = async (id) => {
    setActionLoading(true);
    try {
      const token = getAdminToken();
      await axios.post(`${API_BASE_URL}/api/admin/withdrawal/decline/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Withdrawal declined successfully!');
      fetchPendingWithdrawals();
      fetchUsers(); // Refresh user data because their balance will be refunded
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline withdrawal');
    }
    setActionLoading(false);
  };

  // Admin manual deduct
  const openDeductModal = (user) => {
    setDeductUser(user);
    setDeductForm({ amount: '', currency: 'USD', type: 'fiat' });
    setDeductStatType('balance');
    setShowDeductModal(true);
  };
  const closeDeductModal = () => {
    setShowDeductModal(false);
    setDeductUser(null);
    setDeductForm({ amount: '', currency: 'USD', type: 'fiat' });
  };
  const handleDeductChange = (e) => {
    setDeductForm({ ...deductForm, [e.target.name]: e.target.value });
  };
  const submitDeduct = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = getAdminToken();
      await axios.post(`${API_BASE_URL}/api/transaction/admin/deduct`, {
        userId: deductUser.id,
        amount: deductForm.amount,
        currency: deductForm.currency,
        type: deductForm.type,
        statType: deductStatType,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeDeductModal();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deduct funds');
    }
    setActionLoading(false);
  };

  // Crypto Address Management
  const fetchCryptoAddresses = async () => {
    try {
      const token = getAdminToken();
      if (token) {
        try {
          const payload = jwtDecode(token);
          console.log('Decoded token payload:', payload);
        } catch (e) {
          console.warn('Failed to decode token:', e);
        }
      }
      console.log('Admin fetching crypto addresses from:', `${API_BASE_URL}/api/admin/crypto-addresses`);
      const res = await axios.get(`${API_BASE_URL}/api/admin/crypto-addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Admin crypto addresses API response:', res.data);
      // Defensive type check
      if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        console.log('Admin setting crypto form:', res.data);
        setCryptoForm(res.data);
      } else {
        console.log('Admin invalid response format, using defaults');
        setCryptoForm({ BTC: '', ETH: '', USDT: '', XRP: '' });
        setCryptoMsg('Failed to load crypto addresses.');
      }
    } catch (err) {
      console.error('Admin failed to fetch crypto addresses:', err);
      setCryptoForm({ BTC: '', ETH: '', USDT: '', XRP: '' });
      setCryptoMsg('Failed to load crypto addresses.');
    }
  };

  const openCryptoModal = async () => {
    // Fetch current addresses before opening modal
    await fetchCryptoAddresses();
    setShowCryptoModal(true);
    setCryptoMsg('');
  };

  const closeCryptoModal = () => {
    setShowCryptoModal(false);
    setCryptoMsg('');
    // Don't reset cryptoForm to defaults - keep the current values
    // This ensures the updated addresses remain visible
  };

  const handleCryptoChange = (e) => {
    setCryptoForm({ ...cryptoForm, [e.target.name]: e.target.value });
  };

  const handleCryptoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCryptoFiles({ ...cryptoFiles, [e.target.name]: file });
    }
  };

  const submitCryptoUpdate = async (e) => {
    e.preventDefault();
    setCryptoLoading(true);
    setCryptoMsg('');
    
    try {
      const token = getAdminToken();
      console.log('Updating crypto addresses with token:', token ? 'Token exists' : 'No token');
      console.log('Crypto form data:', cryptoForm);
      console.log('Crypto files:', cryptoFiles);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('BTC', cryptoForm.BTC);
      formData.append('ETH', cryptoForm.ETH);
      formData.append('USDT', cryptoForm.USDT);
      formData.append('XRP', cryptoForm.XRP);
      
      // Append files if they exist
      if (cryptoFiles.BTC_QR) {
        formData.append('BTC_QR', cryptoFiles.BTC_QR);
      }
      if (cryptoFiles.ETH_QR) {
        formData.append('ETH_QR', cryptoFiles.ETH_QR);
      }
      if (cryptoFiles.USDT_QR) {
        formData.append('USDT_QR', cryptoFiles.USDT_QR);
      }
      if (cryptoFiles.XRP_QR) {
        formData.append('XRP_QR', cryptoFiles.XRP_QR);
      }
      
      const res = await axios.post(`${API_BASE_URL}/api/admin/crypto-addresses`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Update response:', res.data);
      setCryptoMsg('Crypto addresses and QR codes updated successfully!');
      
      // Refresh the addresses from backend to ensure we have the latest data
      console.log('Refreshing addresses after update...');
      await fetchCryptoAddresses();
      
      // Clear any uploaded files
      setCryptoFiles({
        BTC_QR: null,
        ETH_QR: null,
        USDT_QR: null,
        XRP_QR: null
      });
      
      setTimeout(() => {
        closeCryptoModal();
      }, 2000);
    } catch (err) {
      console.error('Failed to update crypto addresses:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setCryptoMsg(err.response?.data?.message || 'Failed to update crypto addresses');
    }
    
    setCryptoLoading(false);
  };

  return (
    <div className="container-fluid" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ef 0%, #f5f7fa 100%)', paddingBottom: '2rem' }}>
      {/* Admin Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: '#212529', borderRadius: '0.5rem', marginTop: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div className="container-fluid">
          <span className="navbar-brand fw-bold" style={{ letterSpacing: '1px', fontSize: '1.3rem' }}>Admin Dashboard</span>
          <div className="navbar-nav ms-auto position-relative">
            <div className="nav-item" ref={adminDropdownRef}>
              <button 
                className="btn btn-link nav-link d-flex align-items-center" 
                type="button"
                onClick={() => setShowAdminDropdown((v) => !v)}
                style={{ border: 'none', background: 'none', padding: '8px' }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '24px',
                  height: '18px',
                  cursor: 'pointer'
                }}>
                  <span style={{ display: 'block', width: '100%', height: '3px', background: 'white', borderRadius: '2px', marginBottom: '4px' }}></span>
                  <span style={{ display: 'block', width: '100%', height: '3px', background: 'white', borderRadius: '2px', marginBottom: '4px' }}></span>
                  <span style={{ display: 'block', width: '100%', height: '3px', background: 'white', borderRadius: '2px' }}></span>
                </div>
              </button>
              {showAdminDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  background: 'white',
                  minWidth: '160px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
                  borderRadius: '0.5rem',
                  zIndex: 1000,
                  marginTop: '8px',
                  padding: '0.75rem 0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <button 
                    className="dropdown-item fw-semibold" 
                    onClick={openCryptoModal} 
                    style={{ 
                      width: '100%',
                      textAlign: 'center',
                      border: 'none',
                      background: 'none',
                      fontSize: '1.05rem',
                      padding: '0.5rem 0',
                      borderRadius: '0.25rem',
                      transition: 'background 0.2s',
                      color: '#0d6efd',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#e7f3ff'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    Edit Crypto Addresses
                  </button>
                  <button 
                    className="dropdown-item text-danger fw-semibold" 
                    onClick={handleLogout} 
                    style={{ 
                      width: '100%',
                      textAlign: 'center',
                      border: 'none',
                      background: 'none',
                      fontSize: '1.05rem',
                      padding: '0.5rem 0',
                      borderRadius: '0.25rem',
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f8d7da'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Cards */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ borderRadius: '1rem', minHeight: '350px' }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Admin Dashboard - User Management</h3>
              </div>
              {loading ? (
                <div>Loading users...</div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Country</th>
                      <th>Currency</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(users) ? users.map(user => (
                                              <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.country}</td>
                        <td>{user.currency}</td>
                        <td>{user.phone}</td>
                        <td>{user.role}</td>
                        <td>
                          <button className="btn btn-warning btn-sm me-2" onClick={() => openDepositModal(user)}>Deposit</button>
                          <button className="btn btn-danger btn-sm me-2" onClick={() => openDeductModal(user)}>Deduct</button>
                          <button className="btn btn-primary btn-sm me-2" onClick={() => openEditModal(user)}>Edit</button>
                          <button className="btn btn-info btn-sm me-2" onClick={() => handleLoginAsUser(user)}>Login as User</button>
                          <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(user.id)}>Delete</button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="8">No users found or users is not an array.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ borderRadius: '1rem', minHeight: '350px' }}>
            <div className="card-body p-4">
              {/* All Deposits Section */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">All Deposits</h4>
                <div className="d-flex gap-2">
                  <select 
                    className="form-select form-select-sm" 
                    value={depositSortFilter} 
                    onChange={(e) => setDepositSortFilter(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="all">All Deposits</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select 
                    className="form-select form-select-sm" 
                    value={depositDisplayCount} 
                    onChange={(e) => setDepositDisplayCount(Number(e.target.value))}
                    style={{ width: 'auto' }}
                  >
                    <option value={10}>Show 10</option>
                    <option value={20}>Show 20</option>
                    <option value={50}>Show 50</option>
                    <option value={100}>Show 100</option>
                    <option value={200}>Show 200</option>
                  </select>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={clearAllDeposits}
                    disabled={actionLoading || allDeposits.length === 0}
                  >
                    {actionLoading ? 'Clearing...' : 'Clear All Deposits'}
                  </button>
                </div>
              </div>
              
              {/* Pending Deposits Alert */}
              {getPendingDepositsCount() > 0 && (
                <div className="alert alert-warning alert-dismissible fade show mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Action Required:</strong> You have {getPendingDepositsCount()} pending deposit{getPendingDepositsCount() > 1 ? 's' : ''} that need{getPendingDepositsCount() > 1 ? '' : 's'} your attention. 
                  <button 
                    type="button" 
                    className="btn-close" 
                    data-bs-dismiss="alert" 
                    aria-label="Close"
                    onClick={(e) => e.target.closest('.alert').remove()}
                  ></button>
                </div>
              )}
              
              {allDepositsLoading ? (
                <div>Loading all deposits...</div>
              ) : getFilteredDeposits().length === 0 ? (
                <p>No {depositSortFilter === 'all' ? '' : depositSortFilter} deposits found.</p>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(getPaginatedDeposits()) ? getPaginatedDeposits().map(dep => (
                                              <tr key={dep.id}>
                        <td>{dep.user?.firstName} {dep.user?.lastName}</td>
                        <td>{dep.user?.email}</td>
                        <td>{formatAmount(dep.amount)}</td>
                        <td>{dep.details?.currency}</td>
                        <td>{dep.details?.type}</td>
                        <td>
                          {dep.status === 'pending' && <span className="badge bg-warning text-dark">Pending</span>}
                          {dep.status === 'approved' && <span className="badge bg-success">Approved</span>}
                          {dep.status === 'declined' && <span className="badge bg-danger">Declined</span>}
                          {dep.status === 'completed' && <span className="badge bg-info">Completed</span>}
                        </td>
                        <td>{new Date(dep.createdAt).toLocaleString()}</td>
                        <td>
                          {dep.status === 'pending' && (
                            <>
                                                      <button className="btn btn-success btn-sm me-2" onClick={() => handleApproveDeposit(dep.id)} disabled={actionLoading}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeclineDeposit(dep.id)} disabled={actionLoading}>Decline</button>
                            </>
                          )}
                          {dep.status !== 'pending' && <span className="text-muted">No actions available</span>}
                        </td>
                      </tr>
                    )) : <tr><td colSpan="8">No deposits found or deposits is not an array.</td></tr>}
                  </tbody>
                </table>
              )}
              
              {/* Display Summary */}
              {!allDepositsLoading && getFilteredDeposits().length > 0 && (
                <div className="mt-3 text-muted small">
                  Showing {getPaginatedDeposits().length} of {getFilteredDeposits().length} deposits
                  {getFilteredDeposits().length > depositDisplayCount && (
                    <span className="ms-2">
                      (Use the dropdown above to show more)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row g-4 mt-2">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <div className="card-body p-4">
              {/* Pending Withdrawals Section */}
              <h4 className="card-title mb-3">Pending Withdrawals</h4>
              {pendingWithdrawLoading ? (
                <div>Loading pending withdrawals...</div>
              ) : pendingWithdrawals.length === 0 ? (
                <p>No pending withdrawals found.</p>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(pendingWithdrawals) ? pendingWithdrawals.map(withdrawal => (
                                              <tr key={withdrawal.id}>
                        <td>{withdrawal.user?.firstName} {withdrawal.user?.lastName}</td>
                        <td>{withdrawal.user?.email}</td>
                        <td>{formatAmount(withdrawal.amount)}</td>
                        <td>{withdrawal.details?.currency}</td>
                        <td>{withdrawal.details?.type}</td>
                        <td>{new Date(withdrawal.createdAt).toLocaleString()}</td>
                        <td>
                                                  <button className="btn btn-success btn-sm me-2" onClick={() => handleApproveWithdrawal(withdrawal.id)} disabled={actionLoading}>Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeclineWithdrawal(withdrawal.id)} disabled={actionLoading}>Decline</button>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="7">No pending withdrawals found or pendingWithdrawals is not an array.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={submitEdit}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit User</h5>
                  <button type="button" className="btn-close" onClick={closeEditModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={form.email || ''} onChange={handleEditChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" name="firstName" value={form.firstName || ''} onChange={handleEditChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" name="lastName" value={form.lastName || ''} onChange={handleEditChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Country</label>
                    <input type="text" className="form-control" name="country" value={form.country || ''} onChange={handleEditChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Currency</label>
                    <input type="text" className="form-control" name="currency" value={form.currency || ''} onChange={handleEditChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="text" className="form-control" name="phone" value={form.phone || ''} onChange={handleEditChange} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>{actionLoading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={closeDeleteModal}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this user?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={actionLoading}>{actionLoading ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Deposit Modal */}
      {showDepositModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={submitDeposit}>
                <div className="modal-header">
                  <h5 className="modal-title">Deposit</h5>
                  <button type="button" className="btn-close" onClick={closeDepositModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" name="amount" value={depositForm.amount} onChange={handleDepositChange} required min="1" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Currency</label>
                    <input type="text" className="form-control" name="currency" value={depositForm.currency} onChange={handleDepositChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select className="form-select" name="type" value={depositForm.type} onChange={handleDepositChange} required>
                      <option value="fiat">Fiat</option>
                      <option value="crypto">Crypto</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stat to Manage</label>
                    <select className="form-select" value={depositStatType} onChange={e => setDepositStatType(e.target.value)} required>
                      <option value="balance">Total Balance</option>
                      <option value="invested">Amount Invested</option>
                      <option value="earnings">Total Earnings</option>
                    </select>
                  </div>
                  <div className="alert alert-info">This will add the amount to the selected stat only.</div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeDepositModal}>Cancel</button>
                  <button type="submit" className="btn btn-warning" disabled={actionLoading}>{actionLoading ? 'Processing...' : 'Submit'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Admin Deduct Modal */}
      {showDeductModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={submitDeduct}>
                <div className="modal-header">
                  <h5 className="modal-title">Deduct Funds</h5>
                  <button type="button" className="btn-close" onClick={closeDeductModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">User</label>
                    <input type="text" className="form-control" value={`${deductUser?.firstName} ${deductUser?.lastName} (${deductUser?.email})`} readOnly />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" name="amount" value={deductForm.amount} onChange={handleDeductChange} required min="1" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Currency</label>
                    <input type="text" className="form-control" name="currency" value={deductForm.currency} onChange={handleDeductChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select className="form-select" name="type" value={deductForm.type} onChange={handleDeductChange} required>
                      <option value="fiat">Fiat</option>
                      <option value="crypto">Crypto</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Stat to Deduct From</label>
                    <select className="form-select" value={deductStatType} onChange={e => setDeductStatType(e.target.value)} required>
                      <option value="balance">Total Balance</option>
                      <option value="invested">Amount Invested</option>
                      <option value="earnings">Total Earnings</option>
                    </select>
                  </div>
                  <div className="alert alert-warning">This will deduct the amount from the selected stat. For invested/earnings, it will also deduct from total balance.</div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeDeductModal}>Cancel</button>
                  <button type="submit" className="btn btn-danger" disabled={actionLoading}>{actionLoading ? 'Processing...' : 'Deduct'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Crypto Addresses Modal */}
      {showCryptoModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={submitCryptoUpdate}>
                <div className="modal-header">
                  <h5 className="modal-title">Edit Crypto Deposit Addresses</h5>
                  <button type="button" className="btn-close" onClick={closeCryptoModal}></button>
                </div>
                <div className="modal-body">
                  {cryptoMsg && (
                    <div className={`alert ${cryptoMsg.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
                      {cryptoMsg}
                    </div>
                  )}
                  
                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Bitcoin (BTC) Address</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="BTC" 
                          value={cryptoForm.BTC} 
                          onChange={handleCryptoChange} 
                          placeholder="Enter BTC address"
                          required 
                        />
                        <small className="text-muted">Must start with bc1, 1, or 3</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Ethereum (ETH) Address</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="ETH" 
                          value={cryptoForm.ETH} 
                          onChange={handleCryptoChange} 
                          placeholder="Enter ETH address"
                          required 
                        />
                        <small className="text-muted">Must start with 0x and be 42 characters</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Tether (USDT) Address <span style={{color:'#d4af37', fontWeight:'bold'}}>- Tron (TRC20)</span>
                        </label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="USDT" 
                          value={cryptoForm.USDT} 
                          onChange={handleCryptoChange} 
                          placeholder="Enter USDT address"
                          required 
                        />
                        <small className="text-warning">
                          <i className="fab fa-usdt me-1"></i>Network: Tron (TRC20)
                        </small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Ripple (XRP) Address</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="XRP" 
                          value={cryptoForm.XRP} 
                          onChange={handleCryptoChange} 
                          placeholder="Enter XRP address"
                          required 
                        />
                        <small className="text-muted">Must start with r and be at least 24 characters</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Bitcoin (BTC) QR Code Image</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          name="BTC_QR" 
                          onChange={handleCryptoFileChange} 
                          accept="image/*"
                        />
                        <small className="text-muted">Upload a QR code image for BTC (PNG, JPG, JPEG)</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Ethereum (ETH) QR Code Image</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          name="ETH_QR" 
                          onChange={handleCryptoFileChange} 
                          accept="image/*"
                        />
                        <small className="text-muted">Upload a QR code image for ETH (PNG, JPG, JPEG)</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-bold">
                          Tether (USDT) QR Code Image <span style={{color:'#d4af37', fontWeight:'bold'}}>- Tron (TRC20)</span>
                        </label>
                        <input 
                          type="file" 
                          className="form-control" 
                          name="USDT_QR" 
                          onChange={handleCryptoFileChange} 
                          accept="image/*"
                        />
                        <small className="text-muted">Upload a QR code image for USDT (PNG, JPG, JPEG)</small>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Ripple (XRP) QR Code Image</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          name="XRP_QR" 
                          onChange={handleCryptoFileChange} 
                          accept="image/*"
                        />
                        <small className="text-muted">Upload a QR code image for XRP (PNG, JPG, JPEG)</small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Note:</strong> These addresses and QR code images will be used for all user deposits. Addresses are required, but QR code images are optional. Upload clear, high-quality QR code images (PNG, JPG, JPEG) for the best user experience. Maximum file size: 5MB per image.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeCryptoModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={cryptoLoading}>
                    {cryptoLoading ? 'Updating...' : 'Update Addresses'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 