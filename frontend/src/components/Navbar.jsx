import { useState, useEffect } from "react";
import { NavLink,useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { MdDashboard, MdSavings, MdAttachMoney, MdContacts } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import Cookies from "js-cookie";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get("token");
      setIsAuthenticated(!!token);
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleLogin = () => {
    const token = Cookies.get("token");
    setIsAuthenticated(!!token);
    window.dispatchEvent(new Event("authChange"));
  };

  const handleLogout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    setShowDropdown(false);
    window.dispatchEvent(new Event("authChange"));
    navigate('/')
  };

  const AuthLinks = ({ mobile = false }) => (
    <>
      <NavLink
        to="/savings"
        className={`flex items-center ${mobile ? "justify-center block" : ""} text-white hover:text-gray-300 space-x-2`}
        onClick={() => mobile && setIsOpen(false)}
      >
        <MdSavings className="text-lg" />
        <span>Savings</span>
      </NavLink>
      <NavLink
        to="/transactions"
        className={`flex items-center ${mobile ? "justify-center block" : ""} text-white hover:text-gray-300 space-x-2`}
        onClick={() => mobile && setIsOpen(false)}
      >
        <MdAttachMoney className="text-lg" />
        <span>Transactions</span>
      </NavLink>
    </>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#0A2342] to-[#117A7A] p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <NavLink to="/" className="text-white text-2xl font-bold tracking-wide">
            ChamaPay
          </NavLink>

          {/* Mobile menu button */}
          <button className="md:hidden text-white text-3xl" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <HiX /> : <HiOutlineMenu />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavLink to="/" className="flex items-center text-white hover:text-gray-300 space-x-2">
              <MdDashboard className="text-lg" />
              <span>Dashboard</span>
            </NavLink>

            {isAuthenticated && <AuthLinks />}

            <NavLink to="/contact" className="flex items-center text-white hover:text-gray-300 space-x-2">
              <MdContacts className="text-lg" />
              <span>Contact</span>
            </NavLink>

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
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                      onClick={handleLogin}
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

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-[#117A7A] text-white text-center py-4 space-y-4 z-40">
          <NavLink to="/" className="block flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
            <MdDashboard className="text-lg" />
            <span>Dashboard</span>
          </NavLink>

          {isAuthenticated && <AuthLinks mobile />}

          <NavLink to="/contact" className="block flex items-center justify-center space-x-2" onClick={() => setIsOpen(false)}>
            <MdContacts className="text-lg" />
            <span>Contact</span>
          </NavLink>

          <div className="text-center">
            {isAuthenticated ? (
              <button
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className="block px-4 py-2 text-white hover:bg-gray-800"
                onClick={() => {
                  setIsOpen(false);
                  handleLogin();
                }}
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      )}

      {/* Page Padding */}
      <div className="pt-[80px]">
        {/* Content below navbar */}
      </div>
    </>
  );
};

export default Navbar;
