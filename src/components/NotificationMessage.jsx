import React from 'react';
import { CalendarCheck2 } from 'lucide-react';

export default function NotificationMessage({ notification }) {
  const formattedTime = new Date(notification.createdAt).toLocaleString();

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statusMatch = notification.message.match(/status has been updated to (\w+)/);
  const status = statusMatch ? statusMatch[1] : 'DEFAULT';
  const statusClasses = getStatusColor(status);

  return (
    <div className={`flex items-start gap-4 border border-gray-200 rounded-lg shadow-sm p-4 ${statusClasses} bg-opacity-50`}>
      <div className="p-2 bg-white rounded-full">
        <CalendarCheck2 className="text-blue-600 w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold">{notification.fromUserName}</span> sent a notification:<br />
          <span>{notification.message}</span>
        </p>
        <p className="text-xs mt-1">{formattedTime}</p>
      </div>
    </div>
  );
}
