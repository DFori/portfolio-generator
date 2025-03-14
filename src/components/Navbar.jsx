// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                PortfolioBuilder
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                {auth.currentUser && (
                  <Link
                    to="/dashboard"
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {auth.currentUser ? (
                <button
                  onClick={handleLogout}
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {auth.currentUser && (
              <Link
                to="/dashboard"
                className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {auth.currentUser ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="text-white hover:bg-blue-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;