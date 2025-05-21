import React, { useState, useEffect } from 'react';
import {
  Home,
  Calendar,
  User,
  Bell,
  LogOut,
  Search,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ListingCard from '../components/ListingCard';
import ListingDetails from '../components/ListingDetails';
import BookingForm from '../components/BookingForm';
import NotificationsTab from '../components/NotificationTab';
import axios from 'axios';
import BookingsTab from '../components/BookingTab';
import ChatTab from '../components/ChatTab';

export default function CustomerDashboard() {
    const { token, setToken } = useAuth();
    const username = token?.split('|')[0];
    const [selectedMenu, setSelectedMenu] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastFetchTime, setLastFetchTime] = useState(null);
    const [selectedListing, setSelectedListing] = useState(null);
    const [isBooking, setIsBooking] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    
    useEffect(() => {
      const CACHE_DURATION = 5 * 60 * 1000;
      const shouldFetchData = () => {
        if (!lastFetchTime) return true;
        const timeSinceLastFetch = Date.now() - lastFetchTime;
        return timeSinceLastFetch > CACHE_DURATION;
      };
  
      if (selectedMenu === 'search' && shouldFetchData()) {
        setIsLoading(true);
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/serviceListingsGets`)
          .then(res => {
            const sortedListings = res.data.sort((a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
            );
  
            const randomListings = sortedListings
              .slice(0, Math.min(sortedListings.length, 30))
              .sort(() => Math.random() - 0.5)
              .slice(0, 11);
  
            setListings(res.data);
            setFilteredListings(randomListings);
            setLastFetchTime(Date.now());
          })
          .catch(err => console.error('Error fetching listings', err))
          .finally(() => setIsLoading(false));
      }
    }, [selectedMenu, lastFetchTime]);
  
    const handleSearch = (e) => {
      const q = e.target.value.toLowerCase();
      setSearchQuery(q);
      const filtered = listings.filter(listing =>
        listing.serviceName?.toLowerCase().includes(q) ||
        listing.location?.toLowerCase().includes(q) ||
        listing.description?.toLowerCase().includes(q)
      );
      setFilteredListings(filtered);
    };
  
    const handleLogout = () => {
      setToken(null);
    };
  
    const handleBackToResults = () => {
      setSelectedListing(null);
      setIsBooking(false);
    };

    const handleConfirmBooking = async (info) => {
        setBookingError(null);
        const { date, start, end, listingId } = info;
        const payload = {
            serviceListingId: listingId,
            localDate: date,
            timeSlot: {
            start,
            end
            }
        };
        setIsConfirming(true);

        try {

            const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/booking/create`, // use your correct endpoint here
            payload,
            {
                headers: {
                'X-LOGIN-TOKEN': token,
                'Content-Type': 'application/json'
                }
            }
            );

            setIsBooking(false);
        } catch (error) {
            setIsConfirming(false);
            setBookingError('This time slot is taken, please choose another time slot and chat with provider');
            console.error('❌ Booking failed:', error.response?.data || error.message);
        }
    };

    const handleChat = (listing) => {
      setSelectedMenu('chat');
    };
  
    return (
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
          <div className="px-6 pt-4 pb-4">
            <div className="flex items-center gap-3">
              <img src="/src/assets/logo.png" alt="Logo" className="h-12 object-contain" />
              <p className="text-xl text-gray-800">Hi, {username || 'Customer'}</p>
            </div>
          </div>
  
          <nav className="flex-1 overflow-y-auto px-3">
            <ul className="space-y-2">
              <li>
                <button onClick={() => setSelectedMenu('dashboard')} className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 w-full text-left ${selectedMenu === 'dashboard' ? 'bg-gray-100' : ''}`}>
                  <Home className="w-4 h-4" /> Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedMenu('search')} className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 w-full text-left ${selectedMenu === 'search' ? 'bg-gray-100' : ''}`}>
                  <Search className="w-4 h-4" /> Search Services
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedMenu('bookings')} className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 w-full text-left ${selectedMenu === 'bookings' ? 'bg-gray-100' : ''}`}>
                  <Calendar className="w-4 h-4" /> My Bookings
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedMenu('profile')} className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 w-full text-left ${selectedMenu === 'profile' ? 'bg-gray-100' : ''}`}>
                  <User className="w-4 h-4" /> My Profile
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedMenu('notifications')} className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 w-full text-left ${selectedMenu === 'notifications' ? 'bg-gray-100' : ''}`}>
                  <Bell className="w-4 h-4" /> Notifications
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedMenu('chat')} className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 w-full text-left ${selectedMenu === 'chat' ? 'bg-gray-100' : ''}`}>
                  <MessageCircle className="w-4 h-4" /> Chat
                </button>
              </li>
            </ul>
          </nav>
  
          <div className="border-t border-gray-200 p-3">
            <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-red-600 px-2.5 py-2 rounded-lg hover:bg-red-50 w-full">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>
  
        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">
          {selectedMenu === 'dashboard' && <h2 className="text-2xl font-semibold text-gray-800">Welcome to your Dashboard</h2>}
  
          {selectedMenu === 'search' && (
            <div className="space-y-8">
              {!selectedListing ? (
                <>
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Service</h1>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Browse through our collection of professional services tailored to your needs</p>
                    <div className="max-w-2xl mx-auto relative">
                      <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full px-6 py-4 text-lg text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
  
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-gray-800">Recently Added Services</h2>
                      <span className="text-sm text-gray-500">Showing {filteredListings.length} services</span>
                    </div>
  
                    <div className="mt-6">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32 bg-white rounded-xl shadow-sm">
                          <div className="text-gray-500">Loading services...</div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          {filteredListings.map((listing) => (
                            <ListingCard
                              key={listing.id}
                              serviceName={listing.serviceName}
                              location={listing.location}
                              pricePerHour={listing.pricePerHour}
                              onClick={() => setSelectedListing(listing)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={handleBackToResults}
                    className="mb-2 px-4 py-2 bg-blue-100 text-blue-600 text-sm rounded hover:bg-blue-200"
                  >
                    ← Back to results
                  </button>
                  <ListingDetails
                    listing={selectedListing}
                    isProvider={false}
                    token={token}
                    onBook={()=> setIsBooking(true)}
                    onChat={handleChat}
                    isBooking={isBooking}
                    
                  />
                  {isBooking && selectedListing && (
                    <BookingForm
                        listing={selectedListing}
                        onConfirm={handleConfirmBooking}
                        onCancel={() => setIsBooking(false)}
                        isConfirming={isConfirming}
                        error={bookingError}
                    />
                  )}
                </div>
              )}
            </div>
          )}
  
          {selectedMenu === 'bookings' && <BookingsTab token={token} isProvider={false}/>}
          {selectedMenu === 'profile' && <h2 className="text-2xl font-semibold text-gray-800">Profile Settings</h2>}
          {selectedMenu === 'notifications' && <NotificationsTab token={token} />}
          {selectedMenu === 'chat' && (
            <ChatTab token={token} isProvider={false} />
          )}
        </main>
      </div>
    );
  }
  