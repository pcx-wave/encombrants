import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Truck, Package, User, LogOut, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Truck className="h-8 w-8" />
            <span className="text-xl font-bold">WasteConnect</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                {currentUser?.type === 'client' ? (
                  <>
                    <Link 
                      to="/client/dashboard" 
                      className={`transition-colors hover:text-emerald-100 ${
                        location.pathname.includes('/client/dashboard') ? 'text-white font-semibold' : 'text-emerald-100'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/client/requests" 
                      className={`transition-colors hover:text-emerald-100 ${
                        location.pathname.includes('/client/requests') ? 'text-white font-semibold' : 'text-emerald-100'
                      }`}
                    >
                      My Requests
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/collector/dashboard" 
                      className={`transition-colors hover:text-emerald-100 ${
                        location.pathname.includes('/collector/dashboard') ? 'text-white font-semibold' : 'text-emerald-100'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/collector/routes" 
                      className={`transition-colors hover:text-emerald-100 ${
                        location.pathname.includes('/collector/routes') ? 'text-white font-semibold' : 'text-emerald-100'
                      }`}
                    >
                      My Routes
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center space-x-1 text-emerald-100 hover:text-white">
                    <User className="h-5 w-5" />
                    <span>{currentUser.name.split(' ')[0]}</span>
                  </Link>
                  <button 
                    onClick={logout}
                    className="flex items-center space-x-1 text-emerald-100 hover:text-white"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/about" 
                  className={`transition-colors hover:text-emerald-100 ${
                    location.pathname === '/about' ? 'text-white font-semibold' : 'text-emerald-100'
                  }`}
                >
                  How It Works
                </Link>
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/login" 
                    className="px-4 py-2 rounded transition-colors text-white hover:bg-emerald-600 border border-emerald-100"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 rounded bg-white text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3">
                {currentUser?.type === 'client' ? (
                  <>
                    <Link 
                      to="/client/dashboard" 
                      className={`py-2 px-3 rounded ${
                        location.pathname.includes('/client/dashboard') 
                          ? 'bg-emerald-600 text-white' 
                          : 'text-emerald-100'
                      }`}
                      onClick={toggleMenu}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/client/requests" 
                      className={`py-2 px-3 rounded ${
                        location.pathname.includes('/client/requests') 
                          ? 'bg-emerald-600 text-white' 
                          : 'text-emerald-100'
                      }`}
                      onClick={toggleMenu}
                    >
                      My Requests
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/collector/dashboard" 
                      className={`py-2 px-3 rounded ${
                        location.pathname.includes('/collector/dashboard') 
                          ? 'bg-emerald-600 text-white' 
                          : 'text-emerald-100'
                      }`}
                      onClick={toggleMenu}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/collector/routes" 
                      className={`py-2 px-3 rounded ${
                        location.pathname.includes('/collector/routes') 
                          ? 'bg-emerald-600 text-white' 
                          : 'text-emerald-100'
                      }`}
                      onClick={toggleMenu}
                    >
                      My Routes
                    </Link>
                  </>
                )}
                <Link 
                  to="/profile" 
                  className="py-2 px-3 flex items-center space-x-2 text-emerald-100"
                  onClick={toggleMenu}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="py-2 px-3 flex items-center space-x-2 text-emerald-100 text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/about" 
                  className={`py-2 px-3 rounded ${
                    location.pathname === '/about' 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-emerald-100'
                  }`}
                  onClick={toggleMenu}
                >
                  How It Works
                </Link>
                <Link 
                  to="/login" 
                  className="py-2 px-3 border border-emerald-100 rounded text-white"
                  onClick={toggleMenu}
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="py-2 px-3 bg-white text-emerald-700 rounded"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;