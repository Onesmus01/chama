import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiUsers, FiSettings, FiLogOut, FiDollarSign, FiGift } from "react-icons/fi";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();

    return (
        <div className={`bg-gray-900 text-white h-screen ${isOpen ? "w-64" : "w-20"} transition-all duration-300 flex flex-col`}>
            {/* Sidebar Toggle Button */}
            <button 
                className="p-4 text-gray-300 hover:text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? "<<" : ">>"}
            </button>

            {/* Navigation Links */}
            <nav className="flex-1">
                <ul>
                    <li>
                        <NavLink 
                            to="/admin" 
                            className={({ isActive }) => `p-4 flex items-center hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`}
                        >
                            <FiHome className="mr-3" /> {isOpen && "Dashboard"}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/members"
                            className={({ isActive }) => `p-4 flex items-center hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`}
                        >
                            <FiUsers className="mr-3" /> {isOpen && "Members"}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/payments"
                            className={({ isActive }) => `p-4 flex items-center hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`}
                        >
                            <FiDollarSign className="mr-3" /> {isOpen && "Payments"}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/contributions"
                            className={({ isActive }) => `p-4 flex items-center hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`}
                        >
                            <FiGift className="mr-3" /> {isOpen && "Contributions"}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/settings"
                            className={({ isActive }) => `p-4 flex items-center hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`}
                        >
                            <FiSettings className="mr-3" /> {isOpen && "Settings"}
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* Logout Button */}
            <button 
                className="p-4 text-red-500 hover:bg-red-700 flex items-center"
                onClick={() => navigate("/login")}
            >
                <FiLogOut className="mr-3" /> {isOpen && "Logout"}
            </button>
        </div>
    );
};

export default Sidebar;
