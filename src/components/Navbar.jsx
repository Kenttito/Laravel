import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import 'bootstrap/dist/css/bootstrap.min.css';

// Separate component for just the user dropdown menu
export const UserNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.firstName && decoded.lastName) {
          setUserName(`${decoded.firstName} ${decoded.lastName}`);
        } else if (decoded.user && decoded.user.firstName && decoded.user.lastName) {
          setUserName(`${decoded.user.firstName} ${decoded.user.lastName}`);
        }
        if (decoded.role) {
          setRole(decoded.role);
        } else if (decoded.user && decoded.user.role) {
          setRole(decoded.user.role);
        }
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleDeposit = () => {
    navigate('/deposit');
  };

  const handleActivity = () => {
    navigate('/activity');
  };

  const handleWithdrawal = () => {
    navigate('/withdrawal');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container-fluid">
        <div className="ms-auto position-relative">
          <div className="dropdown">
            <button
              className="btn btn-light dropdown-toggle d-flex align-items-center"
              type="button"
              id="userDropdown"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <span className="me-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                </svg>
              </span>
              {userName || 'User'}
            </button>
            <ul className={`dropdown-menu dropdown-menu-end${dropdownOpen ? ' show' : ''}`} aria-labelledby="userDropdown">
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleProfile}>Profile</button></li>}
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleDashboard}>Dashboard</button></li>}
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleDeposit}>Deposit</button></li>}
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleActivity}>Activity</button></li>}
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleWithdrawal}>Withdrawal</button></li>}
              {(role !== 'admin') && <li><hr className="dropdown-divider" /></li>}
              <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('user');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.firstName && decoded.lastName) {
          setUserName(`${decoded.firstName} ${decoded.lastName}`);
        } else if (decoded.user && decoded.user.firstName && decoded.user.lastName) {
          setUserName(`${decoded.user.firstName} ${decoded.user.lastName}`);
        }
        if (decoded.role) {
          setRole(decoded.role);
        } else if (decoded.user && decoded.user.role) {
          setRole(decoded.user.role);
        }
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleDeposit = () => {
    navigate('/deposit');
  };

  const handleActivity = () => {
    navigate('/activity');
  };

  const handleWithdrawal = () => {
    navigate('/withdrawal');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container-fluid">
        <div className="ms-auto position-relative">
          <div className="dropdown">
            <button
              className="btn btn-light dropdown-toggle d-flex align-items-center"
              type="button"
              id="userDropdown"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <span className="me-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                </svg>
              </span>
              {userName || 'User'}
            </button>
            <ul className={`dropdown-menu dropdown-menu-end${dropdownOpen ? ' show' : ''}`} aria-labelledby="userDropdown">
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleProfile}>Profile</button></li>}
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleDashboard}>Dashboard</button></li>}
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleDeposit}>Deposit</button></li>}
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleActivity}>Activity</button></li>}
              {role !== 'admin' && <li><button className="dropdown-item" onClick={handleWithdrawal}>Withdrawal</button></li>}
              {(role !== 'admin') && <li><hr className="dropdown-divider" /></li>}
              <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 