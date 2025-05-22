import React, { useState } from 'react';

export default function EditListingForm({ listing, onSubmit, onCancel, isSubmitting }) {
  const convertTo24Hour = (time12h) => {
    if (!time12h) return '';
    
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
  
    hours = parseInt(hours);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };
  
  const [formData, setFormData] = useState({
    serviceName: listing.serviceName || '',
    location: listing.location || '',
    pricePerHour: listing.pricePerHour || '',
    description: listing.description || '',
    // Fix the nested availability structure
    availability: Object.entries(listing.availability?.availability || {}).reduce((acc, [day, time]) => ({
      ...acc,
      [day]: {
        start: convertTo24Hour(time.start),
        end: convertTo24Hour(time.end)
      }
    }), {
      MONDAY: { start: '', end: '' },
      TUESDAY: { start: '', end: '' },
      WEDNESDAY: { start: '', end: '' },
      THURSDAY: { start: '', end: '' },
      FRIDAY: { start: '', end: '' },
      SATURDAY: { start: '', end: '' },
      SUNDAY: { start: '', end: '' }
    })
  });

  const [timeErrors, setTimeErrors] = useState({});

  const validateTime = (day, start, end) => {
    // If either start or end is set, both must be set
    if ((start && !end) || (!start && end)) {
      return false;
    }
    // If neither is set, that's valid
    if (!start && !end) {
      return true;
    }
    // If both are set, end must be later than start
    return start < end;
  };

  const handleTimeChange = (day, field, value) => {
    // Value will be in 24-hour format from the input
    if (value) {
      const [hours, minutes] = value.split(':');
      const formattedHours = hours.padStart(2, '0');
      const formattedMinutes = minutes.padStart(2, '0');
      value = `${formattedHours}:${formattedMinutes}`; // Store in 24-hour format
    }
  
    const updatedTime = {
      ...formData.availability[day],
      [field]: value
    };
  
    const isValid = validateTime(
      day, 
      field === 'start' ? value : updatedTime.start, 
      field === 'end' ? value : updatedTime.end
    );
    
    setTimeErrors(prev => ({
      ...prev,
      [day]: isValid ? null : field === 'start' 
        ? 'When setting start time, end time is required'
        : 'When setting end time, start time is required'
    }));
  
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: updatedTime
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(timeErrors).some(error => error)) return;
    
    const convertTo12Hour = (time24) => {
      if (!time24) return '';
      
      let [hours, minutes] = time24.split(':');
      hours = parseInt(hours);
      
      const period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      
      minutes = minutes.padStart(2, '0');
      
      return `${hours}:${minutes} ${period}`;
    };
  
    // Convert availability times to 12-hour format for display
    const formattedAvailability = {};
    Object.entries(formData.availability).forEach(([day, time]) => {
      if (time.start || time.end) {
        formattedAvailability[day] = {
          start: time.start,
          end: time.end
        };
      }
    });
    
    onSubmit({
      ...formData,
      pricePerHour: parseFloat(formData.pricePerHour),
      availability: {
        availability: formattedAvailability
      }
    });
  };

  return (
    <div className="mt-8 border rounded-lg p-6 shadow-sm bg-white space-y-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Service Listing</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Service Name"
            value={formData.serviceName}
            onChange={e => setFormData({ ...formData, serviceName: e.target.value })}
            className="border px-3 py-2 rounded-md"
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="border px-3 py-2 rounded-md"
            required
          />

          <input
            type="number"
            placeholder="Price Per Hour"
            value={formData.pricePerHour}
            onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })}
            className="border px-3 py-2 rounded-md"
            required
          />
        </div>

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="border px-3 py-2 rounded-md w-full"
          rows={4}
          required
        />

        <div>
          <h3 className="text-md font-semibold mb-2">Weekly Availability</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(formData.availability).map(([day, time]) => (
              <div key={day}>
                <label className="block font-medium text-sm mb-1">
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="time"
                    value={time.start}
                    onChange={e => handleTimeChange(day, 'start', e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                  <input
                    type="time"
                    value={time.end}
                    onChange={e => handleTimeChange(day, 'end', e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </div>
                {timeErrors[day] && (
                  <p className="text-red-500 text-xs mt-1">{timeErrors[day]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}