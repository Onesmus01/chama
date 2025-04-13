import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import LoginSignup from './pages/LoginSignup.jsx';
import LearnMore from './pages/LearnMore.jsx';
import Contact from './pages/Contact.jsx';
import Transaction from './pages/Transaction.jsx';
import Savings from './pages/Savings.jsx';
import Dashboard from './admin/Dashboard.jsx'
import Members from './admin/Members.jsx'
import Payments from './admin/Payments.jsx'
import Cookies from 'js-cookie'; // Import js-cookie to access cookies
import Pricing from './components/Pricing.jsx'
import Pay from './pages/Pay.jsx'
import Edit from './admin/Edit.jsx'


// Protected Route Component


// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const token = Cookies.get("token"); // Check the token from cookies
  return token ? element : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/learn" element={<LearnMore />} />
        <Route path="/contact" element={<Contact />} />

        {/* admin  */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/payments" element={<Payments />} />
        <Route path='/members' element={<Members />} />
        <Route path='/pricing' element={<Pricing />} />
        <Route path='/pay' element={<Pay />} />
        <Route path='/edit' element={<Edit />} />





        
        {/* Protected Routes */}
        <Route path="/transactions"  element={<Transaction />} />
        <Route path="/savings"  element={<Savings />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
