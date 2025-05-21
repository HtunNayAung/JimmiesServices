import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="bg-white">
      {/* Navigation Bar */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <nav className="max-w-[85rem] mx-auto flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-gray-900">
            Jimmie's Services
            </Link>

            {/* Nav Actions */}
            <div className="flex items-center space-x-4">
            <Link
                to="/provider/signup"
                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
                Become a Provider
            </Link>
            <Link
                to="/login"
                className="inline-block text-sm font-medium text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition"
            >
                Login
            </Link>
            <Link
                to="/customer/signup"
                className="inline-block text-sm font-medium text-white bg-blue-600 rounded-md px-4 py-2 hover:bg-blue-700 transition"
            >
                Sign up
            </Link>
            </div>
          </nav>
        </header>



      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-800 mb-4">
              Jimmie's Services
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your One-Stop Platform for Professional Home Services
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <a href="/services" className="inline-flex justify-center items-center gap-x-3 text-center bg-blue-600 hover:bg-blue-700 border border-transparent text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white transition py-3 px-4">
                Find Services
              </a>
              <a href="/provider/signup" className="inline-flex justify-center items-center gap-x-3 text-center border border-blue-600 text-blue-600 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white transition py-3 px-4">
                Become a Provider
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="p-4 md:p-6">
              <span className="block mb-1 text-xs font-semibold uppercase text-blue-600">
                For Customers
              </span>
              <h3 className="text-xl font-semibold text-gray-800">
                Find Trusted Professionals
              </h3>
              <p className="mt-3 text-gray-600">
                Connect with verified service providers for all your home maintenance needs.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="p-4 md:p-6">
              <span className="block mb-1 text-xs font-semibold uppercase text-blue-600">
                For Providers
              </span>
              <h3 className="text-xl font-semibold text-gray-800">
                Grow Your Business
              </h3>
              <p className="mt-3 text-gray-600">
                List your services and reach more customers in your area.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group flex flex-col h-full bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="p-4 md:p-6">
              <span className="block mb-1 text-xs font-semibold uppercase text-blue-600">
                Easy Management
              </span>
              <h3 className="text-xl font-semibold text-gray-800">
                Seamless Experience
              </h3>
              <p className="mt-3 text-gray-600">
                Book services, manage appointments, and pay securely all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 sm:text-4xl">
            Popular Services
          </h2>
          <p className="mt-4 text-gray-600">
            Browse through our most requested services
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Cleaning', 'Plumbing', 'Lawn Care', 'Painting'].map((service) => (
            <div key={service} className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md transition">
              <div className="p-4 md:p-5">
                <h3 className="text-lg font-semibold text-gray-800">{service}</h3>
                <p className="mt-2 text-gray-600">Professional {service.toLowerCase()} services</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto w-full max-w-[85rem] py-10 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center">
          <p className="text-gray-600">© 2025 Jimmie's Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;