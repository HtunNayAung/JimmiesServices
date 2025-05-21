import React, { useState, useEffect } from 'react';
import {
  Home,
  List,
  Calendar,
  User,
  Bell,
  MessageCircle,
  Plus,
  LogOut,
} from 'lucide-react';
import ListingCard from '../components/ListingCard';
import ServiceListingForm from '../components/ServiceListingForm';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import ListingDetails from '../components/ListingDetails';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import NotificationsTab from '../components/NotificationTab';
import BookingsTab from '../components/BookingTab';
import ChatTab from '../components/ChatTab';

export default function ProviderDashboard() {

  const { token, setToken } = useAuth();
  const username = token?.split('|')[0];
  const providerId = token?.split('|')[1]; // safely splits and gets the ID
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingListingId, setEditingListingId] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [newListing, setNewListing] = useState({
    serviceName: '',
    location: '',
    pricePerHour: '',
    description: '',
    availability: {
      monday: { start: '', end: '' },
      tuesday: { start: '', end: '' },
      wednesday: { start: '', end: '' },
      thursday: { start: '', end: '' },
      friday: { start: '', end: '' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' },
    },
  });
  const defaultWeek = {
    monday: { start: '', end: '' },
    tuesday: { start: '', end: '' },
    wednesday: { start: '', end: '' },
    thursday: { start: '', end: '' },
    friday: { start: '', end: '' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' },
  };
  

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/serviceListingsGets/provider`,
          {
            headers: {
              'X-LOGIN-TOKEN': token,
            },
          }
        );
        setListings(response.data);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
      }
    };

    if (token) {
      fetchListings();
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
  };

  // Service Creation
  const handleFormSubmit = async () => {
    if (!token) {
      console.error('No token available.');
      return;
    }
  
    const providerId = token.split('|')[1];
  
    // Format availability
    const filteredAvailability = Object.entries(newListing.availability).reduce(
      (acc, [day, time]) => {
        if (time.start && time.end) {
          acc[day.toUpperCase()] = time;
        }
        return acc;
      },
      {}
    );
  
    const baseURL = import.meta.env.VITE_API_BASE_URL;
  
    try {
      setIsSubmitting(true);
  
      if (!editMode) {
        // ✅ CREATE: POST to /serviceListings
        const payload = {
          serviceProviderId: providerId,
          serviceName: newListing.serviceName,
          location: newListing.location,
          pricePerHour: parseFloat(newListing.pricePerHour),
          description: newListing.description,
          availability: {
            availability: filteredAvailability,
          },
        };
  
        await axios.post(`${baseURL}/serviceListings`, payload, {
          headers: {
            'X-LOGIN-TOKEN': token,
            'Content-Type': 'application/json',
          },
        });
      } else {
        console.log("Edit Mode", newListing)
        const payload = {
          serviceProviderId: providerId,
          serviceName: newListing.serviceName,
          location: newListing.location,
          pricePerHour: parseFloat(newListing.pricePerHour),
          description: newListing.description,
          availability: {
            availability: filteredAvailability,
          },
        };

        await axios.put(
          `${baseURL}/serviceListings/update?serviceListingId=${editingListingId}`,
          payload,
          {
            headers: {
              'X-LOGIN-TOKEN': token,
              'Content-Type': 'application/json',
            },
          }
        );

        
      }
  
      // ✅ Refresh listings
      const refreshed = await axios.get(`${baseURL}/serviceListingsGets/provider`, {
        headers: { 'X-LOGIN-TOKEN': token },
      });
  
      setListings(refreshed.data);
      setShowForm(false);
      setEditMode(false);
      setEditingListingId(null);
      setSelectedListing(null);
  
      // ✅ Reset form
      setNewListing({
        serviceName: '',
        location: '',
        pricePerHour: '',
        description: '',
        availability: {
          monday: { start: '', end: '' },
          tuesday: { start: '', end: '' },
          wednesday: { start: '', end: '' },
          thursday: { start: '', end: '' },
          friday: { start: '', end: '' },
          saturday: { start: '', end: '' },
          sunday: { start: '', end: '' },
        },
      });
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChat = () => {
    setSelectedMenu('chat');
  };
  

  // Service Editing
  const handleEdit = (listing) => {
    console.log(listing.serviceListingId, "listing")
    const filledAvailability = listing.availability?.availability || {};
  
    // Normalize to full week
    const fullAvailability = { ...defaultWeek };
    for (const [day, time] of Object.entries(filledAvailability)) {
      fullAvailability[day.toLowerCase()] = time;
    }
  
    setNewListing({
      serviceName: listing.serviceName,
      location: listing.location,
      pricePerHour: listing.pricePerHour,
      description: listing.description,
      availability: fullAvailability,
    });
  
    setEditingListingId(listing.serviceListingId);
    setEditMode(true);
    setShowForm(true);
    setSelectedListing(null);
  };

  // Service Deletion (THIS NEEDS TO BE IMPLEMENTED)***
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this listing? This action cannot be undone.');
  
    if (!confirmDelete) {
      return;
    }
    try {
      setIsSubmitting(true);
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/serviceListings/delete?serviceListingId=${id}`,
        {
          headers: {
            'X-LOGIN-TOKEN': token,
          },
        }
      );

      // Refresh listings after delete
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/serviceListingsGets/provider`,
        {
          headers: { 'X-LOGIN-TOKEN': token },
        }
      );
      setListings(response.data);
      setSelectedListing(null);
      alert('Listing deleted successfully');
    } catch (err) {
      console.error('Failed to delete listing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb (Mobile) */}
      <div className="sticky top-0 inset-x-0 z-20 bg-white border-y border-gray-200 px-4 sm:px-6 lg:px-8 lg:hidden">
        <div className="flex items-center py-2">
          <button
            type="button"
            className="size-8 flex justify-center items-center border border-gray-200 text-gray-800 hover:text-gray-500 rounded-lg"
          >
            <span className="sr-only">Toggle Navigation</span>
            <svg
              className="size-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M15 3v18" />
              <path d="m8 9 3 3-3 3" />
            </svg>
          </button>
          <ol className="ms-3 flex items-center text-sm text-gray-800 whitespace-nowrap">
            <li>Application Layout</li>
            <li className="mx-2 text-gray-400">/</li>
            <li className="font-semibold">Dashboard</li>
          </ol>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed inset-y-0 start-0 z-50 bg-white border-e border-gray-200 w-64 transition-all lg:block hidden">
        <div className="h-full flex flex-col">
          <div className="px-6 pt-4 pb-4">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/logo.png"
                alt="Logo"
                className="h-12 object-contain"
              />
              <p className="text-xl text-gray-800">
                Hi, {username || 'Provider'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3">
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  onClick={() => setSelectedMenu('dashboard')}
                  className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 ${
                    selectedMenu === 'dashboard' ? 'bg-gray-100' : ''
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => setSelectedMenu('listings')}
                  className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 ${
                    selectedMenu === 'listings' ? 'bg-gray-100' : ''
                  }`}
                >
                  <List className="w-4 h-4" />
                  My Listings
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => setSelectedMenu('bookings')}
                  className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 ${
                    selectedMenu === 'bookings' ? 'bg-gray-100' : ''
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => setSelectedMenu('account')}
                  className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 ${
                    selectedMenu === 'account' ? 'bg-gray-100' : ''
                  }`}
                >
                  <User className="w-4 h-4" />
                  Account
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => setSelectedMenu('notifications')}
                  className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 ${
                    selectedMenu === 'notifications' ? 'bg-gray-100' : ''
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => setSelectedMenu('chat')}
                  className={`flex items-center gap-3 text-sm text-gray-800 px-2.5 py-2 rounded-lg hover:bg-gray-100 ${
                    selectedMenu === 'chat' ? 'bg-gray-100' : ''
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </a>
              </li>
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="border-t border-gray-200 p-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-sm text-red-600 px-2.5 py-2 rounded-lg hover:bg-red-50 w-full"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full pt-10 px-4 sm:px-6 md:px-8 lg:ps-64">
        {selectedMenu === 'dashboard' && (
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to Provider Dashboard
          </h1>
        )}

        {selectedMenu === 'listings' && (
          <div className="p-4 sm:p-6 lg:p-8">
            {!showForm && !selectedListing && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">
                    My Listings
                  </h1>
                  <button
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Listing
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing, index) => (
                    <ListingCard
                      key={listing.serviceListingId}
                      serviceName={listing.serviceName}
                      location={listing.location}
                      pricePerHour={listing.pricePerHour}
                      onClick={() => setSelectedListing(listing)}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedListing && !showForm && (
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to Listings
                  </button>
                </div>
                <ListingDetails
                  listing={selectedListing}
                  isProvider={true}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(selectedListing.serviceListingId)}
                />
              </div>
            )}

            {showForm && (
              <ServiceListingForm
                formData={newListing}
                setFormData={setNewListing}
                isSubmitting={isSubmitting}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditMode(false);
                  setEditingListingId(null);
                }}
                editMode={editMode}
              />
            )}
          </div>
        )}

        {selectedMenu === 'notifications' && <NotificationsTab token={token}/>}

        {selectedMenu === 'bookings' && <BookingsTab token={token} isProvider={true} onChat={handleChat}/>}

        {selectedMenu === 'chat' && (
          <ChatTab token={token} isProvider={true} />
        )}
      </div>
    </div>
  );
}