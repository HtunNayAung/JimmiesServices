
import React, { useState } from 'react';

// Utility: convert "HH:mm" formatted string to minutes since midnight
function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export default function BookingForm({ listing, onConfirm, onCancel, isConfirming, error: serverError }) {
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [validationError, setValidationError] = useState('');

  const availability = listing.availability?.availability || {};
  const weekdayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !start || !end) {
      setValidationError('Please fill all fields.');
      return;
    }

    const selectedDay = weekdayMap[new Date(date).getDay()];
    const availableDay = availability[selectedDay];

    if (!availableDay) {
      setValidationError(`This provider is not available on ${selectedDay}.`);
      return;
    }

    if (toMinutes(start) >= toMinutes(end)) {
      setValidationError('Start time must be earlier than end time.');
      return;
    }

    if (
      toMinutes(start) < toMinutes(availableDay.start) ||
      toMinutes(end)   > toMinutes(availableDay.end)
    ) {
      setValidationError(
        `Selected time must be within available hours: ${availableDay.start} – ${availableDay.end}`
      );
      return;
    }

    setValidationError(''); // Clear validation error before submitting
    onConfirm({ date, start, end, listingId: listing.serviceListingId });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-xl space-y-6 max-w-4xl mx-auto"
    >
      <h3 className="text-2xl font-semibold text-gray-800">Book this Service</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>

      {/* Show either validation error or server error */}
      {validationError && <p className="text-sm text-red-600 mt-2">{validationError}</p>}
      {!validationError && serverError && (
        <p className="text-sm text-red-600 mt-2">
          {serverError}.
        </p>
      )}

      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          disabled={isConfirming}
          className={`inline-flex items-center px-5 py-2.5 ${
            isConfirming 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white text-sm font-medium rounded-lg shadow`}
        >
          {isConfirming ? 'Confirming...' : 'Confirm Booking'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isConfirming}
          className={`inline-flex items-center px-5 py-2.5 ${
            isConfirming 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'bg-gray-200 hover:bg-gray-300'
          } text-gray-800 text-sm font-medium rounded-lg shadow`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
