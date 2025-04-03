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

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("token");
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

        
        {/* Protected Routes */}
        <Route path="/transactions" element={<ProtectedRoute element={<Transaction />} />} />
        <Route path="/savings" element={<ProtectedRoute element={<Savings />} />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
