import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Truck, User, LogOut, Menu, X, Home, Package, Route as RouteIcon } from 'lucide-react';

const MobileOptimizedHeader: React.FC = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const handleLogout = useCallback(async () => {
    await logout();
    closeMenu();
  }, [logout, closeMenu]);

  const isActivePath = useCallback((path: string) => {
    return location.pathname.includes(path);
  }, [location.pathname]);

  const NavLink = useCallback(({ to, children, icon: Icon, onClick }: {
    to: string;
    children: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
  }) => (
    <Link
      to={to}
      onClick={onClick || closeMenu}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActivePath(to)
          ? 'bg-emerald-600 text-white font-semibold'
          : 'text-emerald-100 hover:bg-emerald-600 hover:text-white'
      }`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </Link>
  ), [isActivePath, closeMenu]);

  return (
    <header className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <Truck className="h-8 w-8" />
            <span className="text-xl font-bold">WasteConnect</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                {currentUser?.role === 'client' ? (
                  <>
                    <NavLink to="/client/dashboard" icon={Home}>Dashboard</NavLink>
                    <NavLink to="/client/requests" icon={Package}>My Requests</NavLink>
                  </>
                ) : currentUser?.role === 'collector' ? (
                  <>
                    <NavLink to="/collector/dashboard" icon={Home}>Dashboard</NavLink>
                    <NavLink to="/collector/routes" icon={RouteIcon}>My Routes</NavLink>
                  </>
                ) : (
                  <NavLink to="/deposit/dashboard" icon={Home}>Dashboard</NavLink>
                )}
                <div className="flex items-center space-x-4">
                  <NavLink to="/profile" icon={User}>
                    {currentUser.name.split(' ')[0]}
                  </NavLink>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-emerald-100 hover:text-white transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
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
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-emerald-600 transition-colors" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 space-y-2">
            {isAuthenticated ? (
              <>
                {currentUser?.role === 'client' ? (
                  <>
                    <NavLink to="/client/dashboard" icon={Home}>Dashboard</NavLink>
                    <NavLink to="/client/requests" icon={Package}>My Requests</NavLink>
                  </>
                ) : currentUser?.role === 'collector' ? (
                  <>
                    <NavLink to="/collector/dashboard" icon={Home}>Dashboard</NavLink>
                    <NavLink to="/collector/routes" icon={RouteIcon}>My Routes</NavLink>
                  </>
                ) : (
                  <NavLink to="/deposit/dashboard" icon={Home}>Dashboard</NavLink>
                )}
                <NavLink to="/profile" icon={User}>Profile</NavLink>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-emerald-100 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <NavLink to="/login">Log In</NavLink>
                <NavLink to="/signup">Sign Up</NavLink>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default MobileOptimizedHeader;