import React, { useState, useEffect } from 'react';
import { BadgeCheck, Calendar, MapPin, User, Clock, MessageCircle, CreditCard } from 'lucide-react';
import axios from 'axios';

export default function BookingDetails({ booking, isProvider, token, onStatusChange, onBack, onChat }) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [paymentData, setPaymentData] = useState({
    Name: '',
    CardNumber: '',
    Expirly: '',
    CVC: ''
  });
  const [formErrors, setFormErrors] = useState({});


  const handleChatClick = async () => {
    try {
      
      // Send initial "Hi" message
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/messages/send?receiverId=${booking.customerId}`,
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
      onChat();
    } catch (error) {
      console.error('Error sending initial message:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      setError(null);
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/booking/${booking.id}/status?value=${newStatus}`,
        {},
        {
          headers: { 'X-LOGIN-TOKEN': token }
        }
      );
      onStatusChange && onStatusChange(newStatus);
      // Navigate back after successful update
      onBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    try {
      setUpdating(true);
      setError(null);
      const bookingId = booking.id; // or wherever you get booking ID from
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/booking/cancel/${bookingId}`, {
        headers: {
          'X-LOGIN-TOKEN': token, // token should be passed into your component
        },
      });
      console.log('Booking cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel booking:', error.response?.data?.message || error.message);
    } finally {
      setUpdating(false);
    }
  };

  

  const validateForm = () => {
    const errors = {};
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based

    if (!paymentData.Name.trim()) {
      errors.Name = 'Name is required';
    }

    if (!paymentData.CardNumber.trim()) {
      errors.CardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(paymentData.CardNumber.replace(/\s/g, ''))) {
      errors.CardNumber = 'Invalid card number';
    }

    if (!paymentData.Expirly.trim()) {
      errors.Expirly = 'Expiry date is required';
    } else {
      const [month, year] = paymentData.Expirly.split('/').map(num => parseInt(num, 10));
      if (!month || !year || month < 1 || month > 12) {
        errors.Expirly = 'Invalid expiry date format (MM/YY)';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.Expirly = 'Card has expired';
      }
    }

    if (!paymentData.CVC.trim()) {
      errors.CVC = 'CVC is required';
    } else if (!/^\d{3,4}$/.test(paymentData.CVC)) {
      errors.CVC = 'Invalid CVC';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payments/${booking.id}`, {
        ...paymentData
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'X-LOGIN-TOKEN': token 
        }
      });

      // Update the booking status after successful payment
      onStatusChange && onStatusChange('CONFIRMED_PAID');

      onBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const fetchInvoice = async () => {
      if (booking.status === 'CONFIRMED_PAID' && booking.invoiceId) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/invoices/${booking.id}`,
            {
              headers: { 'X-LOGIN-TOKEN': token }
            }
          );
          setInvoice(response.data);
        } catch (err) {
          console.error('Error fetching invoice:', err);
        }
      }
    };

    fetchInvoice();
  }, [booking.status, booking.id, token]);

  useEffect(() => {
    const fetchReview = async () => {
      if (booking.status === 'COMPLETED') {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/reviews/reviewPerBooking?BookingId=${booking.id}`,
            {
              headers: { 'Accept': 'application/json' }
            }
          );
          setReview(response.data);
        } catch (err) {
          console.error('Error fetching review:', err);
        }
      }
    };

    fetchReview();
  }, [booking.status, booking.id, token]);

  const handleReviewSubmit = async () => {
    try {
      setUpdating(true);
      setError(null);
      
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/reviews/${booking.id}`, {
        ...reviewData
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'X-LOGIN-TOKEN': token 
        }
      });

      // Fetch the updated review
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/reviews/reviewPerBooking?BookingId=${booking.id}`,
        {
          
          headers: { 
            'Accept': 'application/json' }
        }
      );
      setReview(response.data);
      setShowReviewForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Booking Details for {booking.serviceName}</h2>

        {isProvider && booking.customerId && (
          <button
            onClick={handleChatClick}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow"
          >
            <MessageCircle size={16} /> Chat with Customer
          </button>
        )}
      </div>

      {!showPaymentForm && !showReviewForm ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800 text-[15px]">
          <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <p><strong>Booking ID:</strong> {booking.id}</p>
            </div>
            <div className="flex items-center gap-2">
              
              {isProvider ? <></> :
              <>
                <User className="w-5 h-5 text-gray-500" />
                <p>
                  <strong>Provider: </strong>{booking.businessName || 'N/A'} (username: {booking.providerName || 'N/A'})
                </p>
              </>}
              
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <p><strong>Location:</strong> {booking.location}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <p><strong>Date:</strong> {booking.localDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <p><strong>Time:</strong> {booking.timeSlot.start} – {booking.timeSlot.end}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-gray-500" />
              <p><strong>Status:</strong> {booking.status}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <p>
                <strong>Payment Status:</strong>{' '}
                <span className={`${booking.invoiceId ? 'text-green-600' : 'text-red-600'}`}>
                  {booking.invoiceId ? 'Paid' : 'Unpaid'}
                </span>
              </p>
            </div>
          </div>

          {/* Invoice Details for Confirmed Paid Bookings */}
          {booking.status === 'CONFIRMED_PAID' && invoice && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Invoice</h3>
              <div className="space-y-2 text-green-700">
                <p><strong>Invoice ID:</strong> {invoice.invoiceId}</p>
                <p><strong>Amount Paid:</strong> ${invoice.amount.toFixed(2)}</p>
                <p><strong>Issue Date:</strong> {new Date(invoice.issueTime).toLocaleString()}</p>
                
              </div>
            </div>
          )}

          {/* Payment Notice for Customers */}
          {!isProvider && booking.status === 'CONFIRMED_UNPAID' && !booking.invoiceId && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Payment Required</h3>
              <p className="text-yellow-700">
                Your booking has been confirmed by provider!
                <br />
                <strong>Note:</strong> Only after payment is made, the service will be provided.
              </p>
              <button
                className="mt-4 px-5 py-2.5 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition"
                onClick={() => setShowPaymentForm(true)}
              >
                Make Payment
              </button>
            </div>
          )}

          {/* Status Change Buttons for Provider */}
          {isProvider && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
            <div className="mt-8">
              <div className="flex flex-wrap gap-3">
                {booking.status === 'PENDING' && (
                  <>
                    
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange('CONFIRMED_UNPAID')}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition shadow ${
                        updating ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      CONFIRM BOOKING
                    </button>
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange('CANCELLED')}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium transition shadow ${
                        updating ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-red-600 hover:text-red-800'
                      }`}
                    >
                      CANCEL BOOKING
                    </button>
                  </>
                )}
                
                {booking.status === 'CONFIRMED_UNPAID' && (
                  <button
                    disabled={updating}
                    onClick={handleCancel}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition shadow ${
                      updating ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-red-600 hover:text-red-800'
                    }`}
                  >
                    CANCEL BOOKING
                  </button>
                )}

                {booking.status === 'CONFIRMED_PAID' && (
                  <button
                    disabled={updating}
                    onClick={() => handleStatusChange('COMPLETED')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition shadow ${
                      updating ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    COMPLETE BOOKING
                  </button>
                )}
              </div>
              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
            </div>
          )}

          {booking.status === 'COMPLETED' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Service Review</h3>
              
              {isProvider ? (
                // Provider view - show customer's review
                review ? (
                  <div className="space-y-2 text-blue-700">
                    <div className="flex items-center gap-2">
                      <strong>Rating:</strong>
                      <div className="flex">
                        {[...Array(5)].map((_, index) => (
                          <span key={index} className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p><strong>Customer Comment:</strong> {review.comment}</p>
                    
                  </div>
                ) : (
                  <p className="text-blue-700">Customer hasn't left a review yet.</p>
                )
              ) : (
                // Customer view - show review form or existing review
                review ? (
                  <div className="space-y-2 text-blue-700">
                    <div className="flex items-center gap-2">
                      <strong>Your Rating:</strong>
                      <div className="flex">
                        {[...Array(5)].map((_, index) => (
                          <span key={index} className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p><strong>Your Comment:</strong> {review.comment}</p>
                    
                  </div>
                ) : (
                  <div>
                    <p className="text-blue-700 mb-3">Share your experience with this service!</p>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Review
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </>
      ) : showReviewForm ? (
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Write Your Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex gap-2">
                {[...Array(5)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setReviewData({ ...reviewData, rating: index + 1 })}
                    className={`text-2xl ${
                      index < reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 focus:outline-none`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="4"
                placeholder="Share your experience..."
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleReviewSubmit}
                disabled={updating}
                className={`flex-1 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium ${
                  updating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {updating ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                disabled={updating}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
              <input
                type="text"
                value={paymentData.Name}
                onChange={(e) => setPaymentData({ ...paymentData, Name: e.target.value })}
                className={`w-full px-3 py-2 border ${formErrors.Name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="John Doe"
              />
              {formErrors.Name && <p className="text-red-500 text-xs mt-1">{formErrors.Name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                value={paymentData.CardNumber}
                onChange={(e) => setPaymentData({ ...paymentData, CardNumber: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                className={`w-full px-3 py-2 border ${formErrors.CardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                placeholder="4111 1111 1111 1111"
                maxLength="19"
              />
              {formErrors.CardNumber && <p className="text-red-500 text-xs mt-1">{formErrors.CardNumber}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  value={paymentData.Expirly}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setPaymentData({ ...paymentData, Expirly: value });
                  }}
                  className={`w-full px-3 py-2 border ${formErrors.Expirly ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  placeholder="MM/YY"
                  maxLength="5"
                />
                {formErrors.Expirly && <p className="text-red-500 text-xs mt-1">{formErrors.Expirly}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                <input
                  type="text"
                  value={paymentData.CVC}
                  onChange={(e) => setPaymentData({ ...paymentData, CVC: e.target.value.replace(/\D/g, '') })}
                  className={`w-full px-3 py-2 border ${formErrors.CVC ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  placeholder="123"
                  maxLength="4"
                />
                {formErrors.CVC && <p className="text-red-500 text-xs mt-1">{formErrors.CVC}</p>}
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePaymentSubmit}
                disabled={updating}
                className={`flex-1 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium ${
                  updating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {updating ? 'Processing...' : 'Pay Now'}
              </button>
              <button
                onClick={() => setShowPaymentForm(false)}
                disabled={updating}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

