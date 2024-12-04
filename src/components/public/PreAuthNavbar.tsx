import React from 'react';
import { Link } from 'react-router-dom';
import { Map as MapIcon } from 'lucide-react';

const PreAuthNavbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <MapIcon className="h-8 w-8 text-[#003f88]" />
              <span className="ml-2 text-xl font-bold text-gray-900">EffiMapPro</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/features"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-[#003f88]"
              >
                Features
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-[#003f88]"
              >
                About
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-[#003f88]"
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-[#003f88]"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#003f88] hover:bg-[#002d63]"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center px-4 py-2 border border-[#f68b24] text-sm font-medium rounded-md text-[#f68b24] bg-white hover:bg-orange-50"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PreAuthNavbar;
