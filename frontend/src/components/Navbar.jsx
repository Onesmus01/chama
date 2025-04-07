import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineMenu, HiX } from "react-icons/hi"; // Menu icons
import { MdDashboard, MdSavings, MdAttachMoney, MdContacts } from "react-icons/md"; // Feature icons
import { FaUserCircle } from "react-icons/fa"; // Profile icon
import Cookies from "js-cookie"; // Import js-cookie for handling cookies

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Check for the presence of the authentication token in cookies
    setIsAuthenticated(!!Cookies.get("token")); // Look for the token cookie
  }, [isAuthenticated]); // Re-run when `isAuthenticated` changes

  const handleLogout = () => {
    Cookies.remove("token"); // Remove the token from cookies
    setIsAuthenticated(false); // Update state to reflect logout
    setShowDropdown(false); // Close the dropdown if open
  };

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#0A2342] to-[#117A7A] p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <NavLink to="/" className="text-white text-2xl font-bold tracking-wide">
            ChamaPay
          </NavLink>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white text-3xl" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <HiX /> : <HiOutlineMenu />}
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavLink to="/" className="flex items-center text-white hover:text-gray-300 space-x-2">
              <MdDashboard className="text-lg" />
              <span>Dashboard</span>
            </NavLink>

              <>
                <NavLink to="/savings" className="flex items-center text-white hover:text-gray-300 space-x-2">
                  <MdSavings className="text-lg" />
                  <span>Savings</span>
                </NavLink>
                <NavLink to="/transactions" className="flex items-center text-white hover:text-gray-300 space-x-2">
                  <MdAttachMoney className="text-lg" />
                  <span>Transactions</span>
                </NavLink>
              </>

            <NavLink to="/contact" className="flex items-center text-white hover:text-gray-300 space-x-2">
              <MdContacts className="text-lg" />
              <span>Contact</span>
            </NavLink>

            {/* Profile & Logout */}
            <div className="relative">
              <FaUserCircle 
                className="text-white text-3xl cursor-pointer" 
                onClick={() => setShowDropdown(!showDropdown)} 
              />
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg">
                  {isAuthenticated ? (
                    <button 
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  ) : (
                    <NavLink 
                      to="/login" 
                      className="block  px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                      Login
                    </NavLink>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-[#117A7A] text-white text-center py-4 space-y-4 z-40">
          <NavLink to="/" className="block flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
            <MdDashboard className="text-lg" />
            <span>Dashboard</span>
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/savings" className="block flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
                <MdSavings className="text-lg" />
                <span>Savings</span>
              </NavLink>
              <NavLink to="/transactions" className="block flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
                <MdAttachMoney className="text-lg" />
                <span>Transactions</span>
              </NavLink>
            </>
          )}

          <NavLink to="/contact" className="block flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
            <MdContacts className="text-lg" />
            <span>Contact</span>
          </NavLink>

          {/* Mobile Profile & Logout */}
          <div className="text-center">
            {isAuthenticated ? (
              <button 
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <NavLink 
                to="/login" 
                className="block px-4 py-2 text-white hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}
      
      {/* Ensure Content is Below the Navbar */}
      <div className="pt-[80px]">
        {/* Page content goes here */}
      </div>
    </>
  );
};

export default Navbar;
