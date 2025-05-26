import { PencilLine, Trash2, Calendar, MessageCircle, Star } from 'lucide-react';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function ListingDetails({ listing, isProvider, onEdit, onDelete, onBook, onChat, isBooking, token }) {
  if (!listing) return null;

  const availability = listing.availability?.availability || {};
  const weekdayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const sortedAvailability = weekdayOrder
    .filter(day => availability[day])
    .map(day => ({ day, time: availability[day] }));

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400 opacity-50" />);
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-300" />);
      }
    }
    return stars;
  };

  const handleChatClick = async () => {
    try {
      
      // Send initial "Hi" message
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/messages/send?receiverId=${listing.serviceProviderId}`,
        {
          conversationId: null,
          content: "hello"
        },
        {
          headers: { 
            'Content-Type': 'application/json',
            'X-LOGIN-TOKEN': token 
          }
        }
      );
      
      // Navigate to chat tab
      onChat(listing);
    } catch (error) {
      console.error('Error sending initial message:', error);
    }
  };

  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (listing?.serviceListingId) {
        try {
          // Fetch reviews
          const reviewsResponse = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/reviews?serviceListingId=${listing.serviceListingId}`,
            {
              headers: { 
                'Accept': 'application/json'
              }
            }
          );
          setReviews(reviewsResponse.data);

          // Fetch average rating
          const ratingResponse = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/reviews/rates?ServiceListingId=${listing.serviceListingId}`,
            {
              headers: { 
                'Accept': 'application/json'
              }
            }
          );
          setAverageRating(ratingResponse.data);
        } catch (err) {
          console.error('Error fetching reviews and rating:', err);
        }
      }
    };

    fetchReviews();
  }, [listing?.serviceListingId]);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-8 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{listing.serviceName}</h2>
          {!isProvider && (
            <>
              {listing.providerName && (
                <p className="text-gray-600 text-sm">
                  Provided by <span className="font-medium text-gray-800">{listing.providerName}</span>
                </p>
              )}
              {listing.businessName && (
                <p className="text-gray-600 text-sm">
                  Business: <span className="font-medium text-gray-800">{listing.businessName}</span>
                </p>
              )}
            </>
          )}
          <div className="flex items-center gap-1 mt-2">
            {renderStars(averageRating || 0)}
            <span className="text-sm text-gray-600 ml-2">
              {averageRating ? `${averageRating.toFixed(1)} / 5` : 'No ratings yet'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 self-start">
          {isProvider ? (
            <>
              <button
                onClick={() => onEdit(listing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow"
              >
                <PencilLine size={16} /> Edit
              </button>
              <button
                onClick={() => onDelete(listing.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-md shadow"
              >
                <Trash2 size={16} /> Delete
              </button>
            </>
          ) : (
            <>
              {
              !isBooking && (
                <button
                  onClick={() => onBook(listing)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow"
                >
                  <Calendar size={16} /> Book Service
                </button>
              )}
              <button
                onClick={handleChatClick}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow"
              >
                <MessageCircle size={16} /> Chat with Provider
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-[15px]">
        <p><strong>Location:</strong> {listing.location}</p>
        <p><strong>Price:</strong> ${listing.pricePerHour} / hour</p>
        <p className="sm:col-span-2"><strong>Description:</strong> {listing.description}</p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Weekly Availability</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedAvailability.map(({ day, time }) => (
            <div
              key={`${day}-${time.start}-${time.end}`}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              <p className="font-medium text-gray-800">
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </p>
              <p className="text-sm text-gray-600 mt-1">{time.start} – {time.end}</p>
            </div>
          ))}
          {sortedAvailability.length === 0 && (
            <p className="text-gray-500 col-span-full">No availability specified.</p>
          )}
        </div>
      </div>

      <div className="mt-10 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <p className="font-medium text-gray-800">Anonymous</p>
                <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
