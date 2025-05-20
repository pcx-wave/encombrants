import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="h-8 w-8 text-emerald-500" />
              <span className="text-xl font-bold text-white">WasteConnect</span>
            </div>
            <p className="text-sm mb-6">
              Connecting individuals with bulky waste to local collectors equipped with vans and trailers.
              Our intelligent route optimization ensures efficient waste collection and disposal.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-emerald-400 transition-colors">Sign Up</Link>
              </li>
            </ul>
          </div>

          {/* For Clients & Collectors */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li className="font-medium text-white">For Clients</li>
              <li>
                <Link to="/client/new-request" className="hover:text-emerald-400 transition-colors">
                  Request Pickup
                </Link>
              </li>
              <li className="mt-4 font-medium text-white">For Collectors</li>
              <li>
                <Link to="/collector/signup" className="hover:text-emerald-400 transition-colors">
                  Join as Collector
                </Link>
              </li>
              <li>
                <Link to="/collector/find-jobs" className="hover:text-emerald-400 transition-colors">
                  Find Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-500 mt-0.5" />
                <span>123 Green Street, Paris, 75000, France</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-emerald-500" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-emerald-500" />
                <span>contact@wasteconnect.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} WasteConnect. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6 text-sm">
            <Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-emerald-400 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;