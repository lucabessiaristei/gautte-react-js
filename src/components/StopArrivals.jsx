// components/StopArrivals.jsx
import { useState, useEffect } from 'react';
import { Clock, Bus } from '@phosphor-icons/react';

export default function StopArrivals({ stop, arrivals, loading }) {
  if (!stop) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 border border-gray-200 border-dashed">
        <p className="text-sm text-gray-500 text-center">
          Select a stop to view arrivals
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Bus size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">{stop.stop_name}</h3>
        </div>
        <p className="text-sm text-gray-500">Loading arrivals...</p>
      </div>
    );
  }

  if (!arrivals || arrivals.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 whitespace-nowrap">{stop.stop_name}</h3>
        </div>
        <p className="text-sm text-gray-500 italic">No upcoming arrivals</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col max-h-full w-full flex-1">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 whitespace-nowrap">{stop.stop_name}</h3>
      </div>

      <div className="overflow-y-auto flex-1 p-2 space-y-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100">
        {arrivals.map((arrival, index) => (
          <div 
            key={`${arrival.tripId}-${index}`}
            className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                {arrival.routeName}
              </div>
              {arrival.delay > 60 && (
                <span className="text-xs text-orange-600 font-medium">
                  +{Math.floor(arrival.delay / 60)}min
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-gray-500" />
              <span className="font-medium text-gray-900">
                {arrival.minutesUntil < 1 ? 'Now' : `${arrival.minutesUntil} min`}
              </span>
              <span className="text-gray-500">
                ({arrival.arrivalTimeFormatted})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}