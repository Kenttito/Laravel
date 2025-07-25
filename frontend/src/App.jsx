import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './i18n'; // Import i18n configuration
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Register from './components/Register';
import RegistrationSuccess from './components/RegistrationSuccess';
import EmailVerification from './components/EmailVerification';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import RecentActivity from './components/RecentActivity';
import Profile from './components/Profile';
import Deposit from './components/Deposit';
import Withdrawal from './components/Withdrawal';
import PendingApproval from './components/PendingApproval';

// Simple test component
const TestComponent = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Kings Invest - Test Page</h1>
    <p>If you can see this, React is working!</p>
    <p>API URL: {process.env.REACT_APP_API_URL}</p>
  </div>
);

function AppWrapper() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/test" element={<TestComponent />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdrawal" element={<Withdrawal />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/activity" element={<RecentActivity />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter basename="/kings-invest-frontend">
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
