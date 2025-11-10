import { useState, useEffect } from 'react';
import TransitMap from './components/Map';
import Sidebar from './components/Sidebar';
import { useGTFSData } from './hooks/useGTFSData';
import { getCurrentDate, getCurrentTime } from './utils/dateHelpers';
import { GTFSRealtimeService } from './services/gtfsRealtimeService';

function App() {
  const { gtfsData, loading, error } = useGTFSData();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedTime, setSelectedTime] = useState(getCurrentTime());
  const [showCloseLine, setShowCloseLine] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [stopArrivals, setStopArrivals] = useState([]);
  const [arrivalsLoading, setArrivalsLoading] = useState(false);
  const [realtimeService] = useState(() => new GTFSRealtimeService());

  useEffect(() => {
    const fetchRealtime = async () => {
      try {
        await realtimeService.fetchTripUpdates();
        
        if (selectedStop) {
          const arrivals = realtimeService.getNextArrivalsForStop(
            selectedStop.stop_id,
            gtfsData
          );
          setStopArrivals(arrivals);
        }
      } catch (error) {
        console.error('Failed to fetch realtime data:', error);
      }
    };

    if (gtfsData.trips) {
      fetchRealtime();
      const interval = setInterval(fetchRealtime, 30000);
      return () => clearInterval(interval);
    }
  }, [gtfsData, selectedStop, realtimeService]);

  const handleStopSelect = async (stop) => {
    setSelectedStop(stop);
    setArrivalsLoading(true);
    
    try {
      const arrivals = realtimeService.getNextArrivalsForStop(
        stop.stop_id,
        gtfsData
      );
      setStopArrivals(arrivals);
    } catch (error) {
      console.error('Failed to get arrivals:', error);
      setStopArrivals([]);
    } finally {
      setArrivalsLoading(false);
    }
  };

  const handleReset = () => {
    window.mapActions?.resetView();
    setSelectedStop(null);
    setStopArrivals([]);
  };

  const handleLocate = () => {
    window.mapActions?.locateUser();
  };

  const handleCloseLine = () => {
    window.mapActions?.closeLine();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Loading GTFS data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-xl text-red-600 gap-4">
        <div>Error loading data: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!gtfsData.stops || !gtfsData.routes) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Preparing data...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        onReset={handleReset}
        onLocate={handleLocate}
        onCloseLine={handleCloseLine}
        showCloseLine={showCloseLine}
        onDateChange={setSelectedDate}
        onTimeChange={setSelectedTime}
        selectedStop={selectedStop}
        stopArrivals={stopArrivals}
        arrivalsLoading={arrivalsLoading}
      />
      <main className="flex-1 relative">
        <TransitMap 
          gtfsData={gtfsData}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onShowCloseLine={setShowCloseLine}
          onStopSelect={handleStopSelect}
        />
      </main>
    </div>
  );
}

export default App;