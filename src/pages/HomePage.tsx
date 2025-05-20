import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, BarChart3, MapPin, RotateCcw, CalendarClock } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, isClient, isCollector } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Efficient Bulky Waste Collection & Disposal
              </h1>
              <p className="text-xl text-emerald-100">
                Connect with local collectors to remove furniture, appliances, rubble, and more. 
                Our intelligent routing ensures optimal collection and proper disposal.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                {isAuthenticated ? (
                  <Link to={isClient ? "/client/dashboard" : "/collector/dashboard"}>
                    <Button 
                      size="lg" 
                      rightIcon={<BarChart3 className="ml-2" />}
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/client/new-request">
                      <Button 
                        size="lg" 
                        rightIcon={<Package className="ml-2" />}
                      >
                        Request Pickup
                      </Button>
                    </Link>
                    <Link to="/collector/signup">
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="bg-opacity-20 backdrop-blur-sm bg-white text-white border-white hover:bg-white hover:bg-opacity-30"
                        rightIcon={<Truck className="ml-2" />}
                      >
                        Join as Collector
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.pexels.com/photos/3965240/pexels-photo-3965240.jpeg" 
                alt="Waste collection service" 
                className="rounded-lg shadow-2xl object-cover h-96 w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Our intelligent system connects waste producers with collectors and optimizes routes 
              to save time, money, and reduce environmental impact.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* For Clients */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="text-emerald-600 mb-4">
                <Package className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">For Clients</h3>
              <ol className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 shrink-0">1</span>
                  <span>Submit a pickup request with details about your waste</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 shrink-0">2</span>
                  <span>Receive and compare proposals from local collectors</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 shrink-0">3</span>
                  <span>Choose the best offer and pay securely online</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 shrink-0">4</span>
                  <span>Get your waste collected and disposed of properly</span>
                </li>
              </ol>
              <div className="mt-6">
                <Link to="/client/new-request">
                  <Button fullWidth>Request a Pickup</Button>
                </Link>
              </div>
            </div>

            {/* For Collectors */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="text-emerald-600 mb-4">
                <Truck className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">For Collectors</h3>
              <ol className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 shrink-0">1</span>
                  <span>Define your vehicle capacity and supported waste types</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 shrink-0">2</span>
                  <span>Browse compatible pickup requests in your area</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 shrink-0">3</span>
                  <span>Submit offers for one or multiple pickup points</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-emerald-100 text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 shrink-0">4</span>
                  <span>Get optimized routes and maximize your earnings</span>
                </li>
              </ol>
              <div className="mt-6">
                <Link to="/collector/signup">
                  <Button fullWidth>Join as Collector</Button>
                </Link>
              </div>
            </div>

            {/* Route Optimization */}
            <div className="bg-white p-8 rounded-lg shadow-md transition-transform hover:scale-105">
              <div className="text-emerald-600 mb-4">
                <RotateCcw className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Route Optimization</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                  <span>Intelligent algorithms create the most efficient collection routes</span>
                </li>
                <li className="flex items-start">
                  <CalendarClock className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                  <span>Considers time windows, vehicle capacity, and waste types</span>
                </li>
                <li className="flex items-start">
                  <Truck className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                  <span>One collector can serve multiple nearby clients in a single trip</span>
                </li>
                <li className="flex items-start">
                  <BarChart3 className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                  <span>Routes always end at appropriate disposal sites based on waste types</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link to="/about">
                  <Button fullWidth variant="secondary">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose WasteConnect?</h2>
            <p className="mt-4 text-lg text-emerald-100 max-w-3xl mx-auto">
              Our platform offers unique advantages for both waste producers and collectors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-emerald-800 bg-opacity-50 p-6 rounded-lg text-center">
              <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cost Efficiency</h3>
              <p className="text-emerald-100">
                Save money with competitive pricing from multiple collectors. Collectors maximize earnings by combining nearby pickup jobs.
              </p>
            </div>

            <div className="bg-emerald-800 bg-opacity-50 p-6 rounded-lg text-center">
              <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Time Saving</h3>
              <p className="text-emerald-100">
                Quick matching process and efficient pickup scheduling. Route optimization cuts travel time by up to 30%.
              </p>
            </div>

            <div className="bg-emerald-800 bg-opacity-50 p-6 rounded-lg text-center">
              <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Environmentally Friendly</h3>
              <p className="text-emerald-100">
                Proper waste disposal at certified facilities. Reduced carbon footprint through optimized collection routes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">What Our Users Say</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Discover how WasteConnect has transformed waste management for our users.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl">
                  LM
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-800">Laura Martin</p>
                  <p className="text-sm text-gray-600">Client • Paris</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I had an old sofa to dispose of and using WasteConnect was so simple. 
                The collector arrived on time and the pricing was very reasonable. 
                Great service!"
              </p>
              <div className="mt-4 flex text-yellow-400">
                ★★★★★
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl">
                  TB
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-800">Thomas Beaumont</p>
                  <p className="text-sm text-gray-600">Collector • Lyon</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The route optimization has completely changed my business. 
                I'm able to handle 40% more pickups per day while spending less on fuel. 
                The platform is intuitive and the support is excellent."
              </p>
              <div className="mt-4 flex text-yellow-400">
                ★★★★★
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl">
                  CP
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-800">Claire Perrin</p>
                  <p className="text-sm text-gray-600">Client • Marseille</p>
                </div>
              </div>
              <p className="text-gray-600">
                "After renovating my apartment, I had a lot of construction waste. 
                Within hours of posting my request, I received several proposals. 
                The collector was professional and ensured proper disposal."
              </p>
              <div className="mt-4 flex text-yellow-400">
                ★★★★☆
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Simplify Your Waste Management?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied users who trust WasteConnect for efficient, 
            eco-friendly bulky waste collection and disposal.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/client/new-request">
              <Button size="lg" variant="primary">Request a Pickup</Button>
            </Link>
            <Link to="/collector/signup">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-opacity-10 backdrop-blur-sm bg-white text-white border-white hover:bg-white hover:bg-opacity-20"
              >
                Join as Collector
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;