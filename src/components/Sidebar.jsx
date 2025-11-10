// components/Sidebar.jsx
import { useState } from 'react';
import { ArrowsClockwise, MapPin, X } from '@phosphor-icons/react';
import { getCurrentDate, getCurrentTime } from '../utils/dateHelpers';
import StopArrivals from './StopArrivals';

export default function Sidebar({ 
  onReset, 
  onLocate, 
  onCloseLine, 
  showCloseLine,
  onDateChange,
  onTimeChange,
  selectedStop,
  stopArrivals,
  arrivalsLoading
}) {
  const [date, setDate] = useState(getCurrentDate());
  const [time, setTime] = useState(getCurrentTime());

  const handleDateChange = (e) => {
    setDate(e.target.value);
    onDateChange?.(e.target.value);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
    onTimeChange?.(e.target.value);
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Transit Map</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time public transport visualization</p>
      </div>

      <div className="p-6 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Controls</h2>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={onReset}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-left text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
          >
            <ArrowsClockwise size={18} />
            Reset View
          </button>

          <button 
            onClick={onLocate}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-left text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
          >
            <MapPin size={18} weight="fill" />
            Center on Location
          </button>

          {showCloseLine && (
            <button 
              onClick={onCloseLine}
              className="w-full px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <X size={18} weight="bold" />
              Close Line
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input 
              type="time" 
              value={time}
              onChange={handleTimeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Next Arrivals</h2>
        
        <StopArrivals 
          stop={selectedStop}
          arrivals={stopArrivals}
          loading={arrivalsLoading}
        />
      </div>
    </aside>
  );
}