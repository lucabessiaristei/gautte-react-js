import { isTripActive, formatDateForGTFS } from '../utils/dateHelpers';

export function getActiveTripsForStop(stopId, gtfsData, dateStr, timeStr) {
  const formattedDate = formatDateForGTFS(dateStr);
  
  return Object.entries(gtfsData.trips).filter(([tripId, trip]) => {
    return (
      trip?.stops?.includes(stopId) && 
      isTripActive(gtfsData.services[trip.service_id], formattedDate, timeStr)
    );
  });
}

export function getRoutesForStop(stopId, gtfsData, dateStr, timeStr) {
  const activeTrips = getActiveTripsForStop(stopId, gtfsData, dateStr, timeStr);
  
  const routeGroups = new Map();
  activeTrips.forEach(([tripId, trip]) => {
    const routeId = trip.route_id;
    if (!routeGroups.has(routeId)) {
      routeGroups.set(routeId, []);
    }
    routeGroups.get(routeId).push(tripId);
  });

  return routeGroups;
}

export function getTripsByDirection(routeId, gtfsData, dateStr, timeStr) {
  const formattedDate = formatDateForGTFS(dateStr);
  
  const routeTrips = Object.entries(gtfsData.trips).filter(([tripId, trip]) => 
    trip.route_id === routeId && 
    isTripActive(gtfsData.services[trip.service_id], formattedDate, timeStr)
  );

  const tripsByDirection = {};
  routeTrips.forEach(([tripId, trip]) => {
    const direction = trip.direction_id || '0';
    if (!tripsByDirection[direction]) {
      tripsByDirection[direction] = trip;
    }
  });

  return tripsByDirection;
}