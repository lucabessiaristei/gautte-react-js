import { useState, useEffect } from 'react';

export default function StopPopup({ 
  stop, 
  activeRoutes,
  gtfsData,
  onRouteSelect,
  currentVisibleRouteId,
  loading
}) {
  if (!stop || !gtfsData?.routes) return null;

  if (loading) {
    return (
      <div className="p-3 pr-10">
        <h3 className="text-base font-semibold text-gray-900 mb-1">{stop.stop_name}</h3>
        <p className="text-sm text-gray-500">Loading lines...</p>
      </div>
    );
  }

  if (!activeRoutes || activeRoutes.length === 0) {
    return (
      <div className="p-3 pr-10">
        <h3 className="text-base font-semibold text-gray-900 mb-1">{stop.stop_name}</h3>
        <p className="text-sm text-gray-500 italic">No active lines today</p>
      </div>
    );
  }

  // Determine initial selection
  const initialRoute = (currentVisibleRouteId && activeRoutes.includes(currentVisibleRouteId))
    ? currentVisibleRouteId
    : activeRoutes[0];

  const [selectedRouteId, setSelectedRouteId] = useState(initialRoute);

  // Call onRouteSelect once on mount with the initial selection
  useEffect(() => {
    onRouteSelect(initialRoute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync with external changes
  useEffect(() => {
    if (
      currentVisibleRouteId &&
      activeRoutes.includes(currentVisibleRouteId) &&
      currentVisibleRouteId !== selectedRouteId
    ) {
      setSelectedRouteId(currentVisibleRouteId);
    }
  }, [currentVisibleRouteId, activeRoutes, selectedRouteId]);

  const handleRouteChange = (routeId) => {
    setSelectedRouteId(routeId);
    onRouteSelect(routeId);
  };

  return (
    <div className="p-3 pr-10 min-w-[200px]">
      <h3 className="text-base font-semibold text-gray-900 mb-3">{stop.stop_name}</h3>
      <div className="space-y-2">
        {activeRoutes.map((routeId) => {
          const route = gtfsData.routes[routeId];
          const label = route?.route_short_name || route?.route_long_name || `ID ${routeId}`;
          const isChecked = routeId === selectedRouteId;

          return (
            <label
              key={routeId}
              className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name={`route-${stop.stop_id}`}
                value={routeId}
                checked={isChecked}
                onChange={() => handleRouteChange(routeId)}
                className="w-4 h-4 text-blue-600 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">Line {label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}