import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// UI Providers
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

// Lazy load pages
const Home = React.lazy(() => import("./pages/Home.jsx"));
const LoginSignup = React.lazy(() => import("./pages/LoginSignup.jsx"));
const LearnMore = React.lazy(() => import("./pages/LearnMore.jsx"));
const Contact = React.lazy(() => import("./pages/Contact.jsx"));
const Pricing = React.lazy(() => import("./components/Pricing.jsx"));
const Pay = React.lazy(() => import("./pages/Pay.jsx"));
const Transaction = React.lazy(() => import("./pages/Transaction.jsx"));
const Savings = React.lazy(() => import("./pages/Savings.jsx"));
const FAQS = React.lazy(() => import("./components/FAQS.jsx"));
const ContactSupport = React.lazy(() => import("./components/ContactSupport.jsx"));
const PrivacyPolicy = React.lazy(() => import("./components/PrivacyPolicy.jsx"));
const TermsOfService = React.lazy(() => import("./components/TermsOfService.jsx"));
const UnauthorizedAccess = React.lazy(() => import("./pages/UnauthorizedAccess.jsx"));
const Index = React.lazy(() => import("./pages/Index.jsx"));
const NotFound = React.lazy(() => import("./pages/NotFound.jsx"));

// Admin Pages
const Dashboard = React.lazy(() => import("./admin/Dashboard.jsx"));
const Members = React.lazy(() => import("./admin/Members.jsx"));
const Payments = React.lazy(() => import("./admin/Payments.jsx"));
const Edit = React.lazy(() => import("./admin/Edit.jsx"));

// Spinner
const Spinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-20 h-20 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
  </div>
);

// Protected Route
const ProtectedRoute = ({ element, role }) => {
  const token =
    Cookies.get("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");

  if (!token || typeof token !== "string" || token.split(".").length !== 3) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.exp < Date.now() / 1000) return <Navigate to="/login" replace />;

    if (role) {
      const allowed = Array.isArray(role)
        ? role.includes(decoded.role)
        : decoded.role === role;

      if (!allowed) return <Navigate to="/unauthorized" replace />;
    }

    return element;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

// Instantiate QueryClient
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <Navbar />
          <ScrollToTop />
          <Suspense fallback={<Spinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<LoginSignup />} />
              <Route path="/learn" element={<LearnMore />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/faq" element={<FAQS />} />
              <Route path="/contact-support" element={<ContactSupport />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />

              {/* Protected Routes */}
              <Route
                path="/pay"
                element={<ProtectedRoute element={<Pay />} role={["member", "admin"]} />}
              />
              <Route
                path="/transactions"
                element={<ProtectedRoute element={<Transaction />} role={["member", "admin"]} />}
              />
              <Route
                path="/savings"
                element={<ProtectedRoute element={<Savings />} role={["member", "admin"]} />}
              />

              {/* Admin Protected Routes */}
              <Route path="/admin" element={<ProtectedRoute element={<Dashboard />} role="admin" />} />
              <Route path="/payments" element={<ProtectedRoute element={<Payments />} role="admin" />} />
              <Route path="/members" element={<ProtectedRoute element={<Members />} role="admin" />} />
              <Route path="/edit" element={<ProtectedRoute element={<Edit />} role="admin" />} />

              {/* Unauthorized & Not Found */}
              <Route path="/unauthorized" element={<UnauthorizedAccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
