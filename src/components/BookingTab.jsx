import React, { useEffect, useState } from 'react';
import BookingDetails from './BookingDetails';
import axios from 'axios';

export default function BookingsTab({ token, isProvider, onChat }) {
  const [bookings, setBookings] = useState([]);
  const [serviceListings, setServiceListings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (!token) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);

        if (isProvider) {
          const serviceListingRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/serviceListingsGets/provider`, {
            headers: { 'X-LOGIN-TOKEN': token }
          });
          const listings = serviceListingRes.data;
          setServiceListings(listings);

          if (!listings.length) throw new Error('No service listings found.');

          const bookingPromises = listings.map(service =>
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/booking/serviceProvider`, {
              headers: { 'X-LOGIN-TOKEN': token },
              params: {
                serviceListingId: service.serviceListingId
              }
            })
          );

          const responses = await Promise.all(bookingPromises);
          const combined = responses
            .filter(res => res.data && Array.isArray(res.data) && res.data.length > 0)
            .flatMap(res => res.data);

          if (combined.length === 0) {
            setBookings([]);
            setLoading(false);
            return;
          }

          const enriched = combined.map(b => {
            const match = listings.find(l => l.serviceListingId === b.serviceListingId);
            if (!match) {
              console.warn(`No matching listing found for serviceListingId: ${b.serviceListingId}`);
              return null;
            }
            
            return {
              ...b,
              serviceName: match.serviceName || 'Unknown',
              location: match.location || 'Unknown',
              providerId: match.serviceProviderId || 'Unknown',
              providerName: match.serviceProviderName || 'Unknown',
              businessName: match.businessName || 'Unknown'
            };
          }).filter(Boolean);

          setBookings(enriched);
        } else {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/booking/customer`, {
            headers: { 'X-LOGIN-TOKEN': token }
          });

          // Get distinct service listings from bookings
          const customerListings = Array.from(new Set(res.data.map(b => b.serviceListingId)));

          const listingDetails = await Promise.all(
            customerListings.map(id =>
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/serviceListingsGets/${id}`, {
                    headers: { 'X-LOGIN-TOKEN': token }
                  })
            )
          );

          const serviceMap = Object.fromEntries(
            listingDetails.map(res => [res.data.serviceListingId, res.data])
          );

          const enriched = res.data.map(b => {
            const match = serviceMap[b.serviceListingId];

            return {
              ...b,
              serviceName: match?.serviceName || 'Unknown',
              location: match?.location || 'Unknown',
              providerId: match.serviceProviderId || 'Unknown',
              providerName: match.serviceProviderName || 'Unknown',
              businessName: match.businessName || 'Unknown'
            };
          });
          setBookings(enriched);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token, isProvider]);

  const handleStatusChange = (newStatus) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === selectedBooking.id ? { ...b, status: newStatus } : b
      )
    );
  };

  const statusCategories = [
    'PENDING',
    'CONFIRMED_UNPAID',
    'CONFIRMED_PAID',
    'COMPLETED',
    'CANCELLED'
  ];
  
  // Update the status descriptions for display
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED_UNPAID':
        return 'Confirmed (Unpaid)';
      case 'CONFIRMED_PAID':
        return 'Confirmed (Paid)';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };
  const filteredBookings = activeTab === 'ALL' 
    ? [...bookings].sort((a, b) => new Date(a.localDate) - new Date(b.localDate))
    : [...bookings]
        .filter(b => b.status === activeTab)
        .sort((a, b) => new Date(b.localDate) - new Date(a.localDate));
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      {!selectedBooking ? (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {isProvider ? 'Service Bookings' : 'My Bookings'}
          </h2>

          <div className="mb-6 flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition shadow-sm ${
                activeTab === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Bookings
            </button>
            {statusCategories.map(status => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition shadow-sm ${
                  activeTab === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getStatusDisplay(status)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-gray-500">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-gray-500">No {getStatusDisplay(activeTab).toLowerCase()} bookings found.</div>
          ) : (
            <ul className="space-y-4">
              {filteredBookings.map(booking => (
                <li
                  key={booking.id}
                  className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        <strong>{booking.serviceName}</strong> — {booking.localDate} ({booking.timeSlot.start} - {booking.timeSlot.end})
                      </p>
                      <p className="text-xs text-gray-500">Status: {getStatusDisplay(booking.status)}</p>
                    </div>
                    <div className="text-sm text-blue-600">View →</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div>
          <button
            onClick={() => setSelectedBooking(null)}
            className="mb-4 px-4 py-2 bg-blue-100 text-blue-600 text-sm rounded hover:bg-blue-200"
          >
            ← Back to Bookings
          </button>
          <BookingDetails
            booking={selectedBooking}
            isProvider={isProvider}
            token={token}
            onStatusChange={handleStatusChange}
            onBack={() => setSelectedBooking(null) }
            onChat={onChat}
           
          />
        </div>
      )}
    </div>
  );
}
