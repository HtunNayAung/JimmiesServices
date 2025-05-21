import React from 'react';
import { MapPin, DollarSign } from 'lucide-react';

export default function ListingCard({ serviceName, location, pricePerHour, onClick }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 w-full max-w-sm hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-2">{serviceName}</h2>

      <div className="flex items-center text-gray-600 text-sm mb-2">
        <MapPin className="w-4 h-4 mr-1" />
        <span>{location}</span>
      </div>

      <div className="flex items-center text-green-700 font-semibold text-lg mb-4">
        <DollarSign className="w-4 h-4 mr-1" />
        {pricePerHour}
        <span className="text-sm text-gray-500 ml-1">/ hour</span>
      </div>

      <button
        className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
        onClick={onClick}
      >
        View
      </button>
    </div>
  );
}
