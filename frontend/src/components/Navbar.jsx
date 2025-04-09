// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChalkboardTeacher, FaChartBar, FaHistory, FaHome, FaBars, FaTimes, FaUserTie } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Return null if not authenticated
  if (!isAuthenticated) return null;
  
  // Determine which page we're on
  const isDashboardPage = location.pathname === '/dashboard';
  const isTeachingReportPage = location.pathname === '/create-report';
  const isPdaReportPage = location.pathname === '/create-pda-report';
  const isExpertReportPage = location.pathname === '/create-expert-report';
  const isPreviousReportsPage = location.pathname === '/previous-reports';

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      {/* Top bar with logo and mobile toggle */}
      <div className="px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">Report Generator</Link>
        
        {/* Mobile menu toggle */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
          onClick={toggleMenu}
        >
          {menuOpen ? <FaTimes className="text-gray-600" /> : <FaBars className="text-gray-600" />}
        </button>
        
        {/* Desktop navigation - hidden on mobile */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Show Dashboard button if not on Dashboard */}
          {!isDashboardPage && (
            <Link 
              to="/dashboard" 
              className="px-3 py-2 flex items-center text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition duration-300"
            >
              <FaHome className="mr-1" /> Dashboard
            </Link>
          )}
          
          {/* Show Teaching Report button if not on the Teaching Report page */}
          {!isTeachingReportPage && (
            <Link 
              to="/create-report" 
              className="px-3 py-2 flex items-center text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition duration-300"
            >
              <FaChalkboardTeacher className="mr-1" /> Teaching Report
            </Link>
          )}
          
          {/* Show PDA Report button if not on the PDA Report page */}
          {!isPdaReportPage && (
            <Link 
              to="/create-pda-report" 
              className="px-3 py-2 flex items-center text-purple-600 border border-purple-600 rounded hover:bg-purple-50 transition duration-300"
            >
              <FaChartBar className="mr-1" /> PDA Report
            </Link>
          )}
          
          {/* Show Expert Report button if not on the Expert Report page */}
          {!isExpertReportPage && (
            <Link 
              to="/create-expert-report" 
              className="px-3 py-2 flex items-center text-orange-600 border border-orange-600 rounded hover:bg-orange-50 transition duration-300"
            >
              <FaUserTie className="mr-1" /> Expert Report
            </Link>
          )}
          
          {/* Show Previous Reports button if not on the Previous Reports page */}
          {!isPreviousReportsPage && (
            <Link 
              to="/previous-reports" 
              className="px-3 py-2 flex items-center text-green-600 border border-green-600 rounded hover:bg-green-50 transition duration-300"
            >
              <FaHistory className="mr-1" /> Previous Reports
            </Link>
          )}
          
          {/* Logout button */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {menuOpen && (
        <div className="md:hidden p-4 pt-0 border-t border-gray-200 bg-white">
          <div className="flex flex-col space-y-2">
            {/* Show Dashboard button if not on Dashboard */}
            {!isDashboardPage && (
              <Link 
                to="/dashboard" 
                className="px-3 py-2 flex items-center text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition duration-300"
                onClick={() => setMenuOpen(false)}
              >
                <FaHome className="mr-2" /> Dashboard
              </Link>
            )}
            
            {/* Show Teaching Report button if not on the Teaching Report page */}
            {!isTeachingReportPage && (
              <Link 
                to="/create-report" 
                className="px-3 py-2 flex items-center text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition duration-300"
                onClick={() => setMenuOpen(false)}
              >
                <FaChalkboardTeacher className="mr-2" /> Teaching Report
              </Link>
            )}
            
            {/* Show PDA Report button if not on the PDA Report page */}
            {!isPdaReportPage && (
              <Link 
                to="/create-pda-report" 
                className="px-3 py-2 flex items-center text-purple-600 border border-purple-600 rounded hover:bg-purple-50 transition duration-300"
                onClick={() => setMenuOpen(false)}
              >
                <FaChartBar className="mr-2" /> PDA Report
              </Link>
            )}
            
            {/* Show Expert Report button if not on the Expert Report page */}
            {!isExpertReportPage && (
              <Link 
                to="/create-expert-report" 
                className="px-3 py-2 flex items-center text-orange-600 border border-orange-600 rounded hover:bg-orange-50 transition duration-300"
                onClick={() => setMenuOpen(false)}
              >
                <FaUserTie className="mr-2" /> Expert Report
              </Link>
            )}
            
            {/* Show Previous Reports button if not on the Previous Reports page */}
            {!isPreviousReportsPage && (
              <Link 
                to="/previous-reports" 
                className="px-3 py-2 flex items-center text-green-600 border border-green-600 rounded hover:bg-green-50 transition duration-300"
                onClick={() => setMenuOpen(false)}
              >
                <FaHistory className="mr-2" /> Previous Reports
              </Link>
            )}
            
            {/* Logout button */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
                setMenuOpen(false);
              }}
              className="px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition duration-300 flex items-center"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
