import React, { useState } from 'react';

export default function ServiceListingForm({
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  onCancel
}) {
  const [timeErrors, setTimeErrors] = useState({});

  const validateTime = (day, start, end) => {
    const errors = {};
    
    // If start time is set, end time must be set
    if (start && !end) {
      errors[day] = 'End time is required when start time is set';
    }
    // If end time is set, start time must be set
    else if (!start && end) {
      errors[day] = 'Start time is required when end time is set';
    }
    // If both are set, end must be later than start
    else if (start && end && start >= end) {
      errors[day] = 'End time must be later than start time';
    }

    setTimeErrors(prev => ({
      ...prev,
      [day]: errors[day]
    }));

    return !errors[day];
  };

  const handleTimeChange = (day, field, value) => {
    const updatedTime = {
      ...formData.availability[day],
      [field]: value
    };

    validateTime(day, field === 'start' ? value : updatedTime.start, field === 'end' ? value : updatedTime.end);

    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: updatedTime
      }
    }));
  };

  return (
    <div className="mt-8 border rounded-lg p-6 shadow-sm bg-white space-y-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Create New Listing
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          name="serviceName"
          placeholder="Service Name"
          value={formData.serviceName}
          onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />

        <input
          type="number"
          name="pricePerHour"
          placeholder="Price Per Hour"
          value={formData.pricePerHour}
          onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
        />
      </div>

      <textarea
        name="description"
        placeholder="Service Description"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
        rows={4}
        className="border px-3 py-2 rounded-md w-full"
      />

      <div>
        <h3 className="text-md font-semibold mb-2">Weekly Availability</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(formData.availability).map(([day, time]) => (
            <div key={day}>
              <label className="block font-medium capitalize text-sm mb-1">{day}</label>
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="time"
                    value={time.start}
                    onChange={e => handleTimeChange(day, 'start', e.target.value)}
                    className={`border px-2 py-1 rounded w-full ${
                      timeErrors[day] ? 'border-red-500' : ''
                    }`}
                  />
                  <input
                    type="time"
                    value={time.end}
                    onChange={e => handleTimeChange(day, 'end', e.target.value)}
                    className={`border px-2 py-1 rounded w-full ${
                      timeErrors[day] ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {timeErrors[day] && (
                  <p className="text-red-500 text-xs">{timeErrors[day]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={(e) => {
            e.preventDefault();
            const hasErrors = Object.entries(formData.availability).some(([day, time]) => {
              return !validateTime(day, time.start, time.end);
            });
            if (!hasErrors) {
              onSubmit();
            }
          }}
          disabled={isSubmitting || Object.keys(timeErrors).length > 0}
        >
          {isSubmitting ? 'Creating...' : 'Create Listing'}
        </button>

        <button
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
