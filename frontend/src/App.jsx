import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import LoginSignup from './pages/LoginSignup.jsx';
import LearnMore from './pages/LearnMore.jsx';
import Contact from './pages/Contact.jsx';
import Pricing from './components/Pricing.jsx';
import Pay from './pages/Pay.jsx';
import Transaction from './pages/Transaction.jsx';
import Savings from './pages/Savings.jsx';
import FAQS from './components/FAQS.jsx'
import ContactSupport from './components/ContactSupport.jsx'
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import TermsOfService from './components/TermsOfService.jsx'
import UnauthorizedAccess from './pages/UnauthorizedAccess.jsx'


// Admin Pages
import Dashboard from './admin/Dashboard.jsx';
import Members from './admin/Members.jsx';
import Payments from './admin/Payments.jsx';
import Edit from './admin/Edit.jsx';

const ProtectedRoute = ({ element, role }) => {
  const token =
    Cookies.get('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken');

  // Basic token format check: must contain 3 segments
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    console.warn('⛔ No valid token found');
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Check if the token is expired
    const currentTime = Date.now() / 1000; // Get current time in seconds
    if (decoded.exp < currentTime) {
      console.warn('⛔ Token expired');
      return <Navigate to="/login" replace />;
    }

    // Role-based access control
    if (role) {
      const allowed = Array.isArray(role)
        ? role.includes(decoded.role)
        : decoded.role === role;

      if (!allowed) {
        console.warn('🚫 Unauthorized access: Role mismatch');
        return <Navigate to="/unauthorized" replace />;  // Redirecting to an Unauthorized page
      }
    }

    return element;
  } catch (err) {
    console.error('❌ Token Verification Failed:', err.message);
    return <Navigate to="/login" replace />;
  }
};

const App = () => {
  return (
    <div className='bg-gray-200'>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/learn" element={<LearnMore />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/faq" element={<FAQS />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />



        



        {/* Shared Protected Route (member or admin) */}
        <Route
          path="/pay"
          element={<ProtectedRoute element={<Pay />} role={['member', 'admin']} />}
        />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute element={<Dashboard />} role="admin" />} />
        <Route path="/payments" element={<ProtectedRoute element={<Payments />} role="admin" />} />
        <Route path="/members" element={<ProtectedRoute element={<Members />} role="admin" />} />
        <Route path="/edit" element={<ProtectedRoute element={<Edit />} role="admin" />} />

        {/* Member/User Protected Routes */}
        <Route path="/transactions" element={<ProtectedRoute element={<Transaction />} role={["member","admin"]} />} />
        <Route path="/savings" element={<ProtectedRoute element={<Savings />} role={["member","admin"]} />} />

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<UnauthorizedAccess />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
