import React from 'react';

export default function ServiceListingForm({
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  onCancel,
  editMode
}) {
  return (
    <div className="mt-8 border rounded-lg p-6 shadow-sm bg-white space-y-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {editMode ? 'Update Listing' : 'Create New Listing'}
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
              <div className="flex space-x-2">
                <input
                  type="time"
                  value={time.start}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        [day]: { ...prev.availability[day], start: e.target.value }
                      }
                    }))
                  }
                  className="border px-2 py-1 rounded w-full"
                />
                <input
                  type="time"
                  value={time.end}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        [day]: { ...prev.availability[day], end: e.target.value }
                      }
                    }))
                  }
                  className="border px-2 py-1 rounded w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={onSubmit}
            disabled={isSubmitting}
            >
            {isSubmitting ? (editMode ? 'Updating...' : 'Submitting...') : (editMode ? 'Update' : 'Submit')}
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
