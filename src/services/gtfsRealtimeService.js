// services/gtfsRealtimeService.js
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

export class GTFSRealtimeService {
  constructor() {
    this.apiUrl = '/api/realtime';
    this.tripDelays = new Map();
  }

  async fetchTripUpdates() {
    try {
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
      );

      this.tripDelays.clear();

      feed.entity.forEach((entity) => {
        if (!entity.tripUpdate) return;

        const tripUpdate = entity.tripUpdate;
        const tripId = tripUpdate.trip?.tripId || entity.id;
        
        if (!this.tripDelays.has(tripId)) {
          this.tripDelays.set(tripId, new Map());
        }

        const delays = this.tripDelays.get(tripId);
        const stopTimeUpdates = tripUpdate.stopTimeUpdate || [];

        stopTimeUpdates.forEach(stu => {
          const stopSeq = stu.stopSequence;
          const delay = stu.arrival?.delay || stu.departure?.delay || 0;
          delays.set(stopSeq, delay);
        });
      });

      // console.log('Loaded delays for', this.tripDelays.size, 'trips');
      return this.tripDelays;
    } catch (error) {
      console.error('Error fetching GTFS realtime data:', error);
      throw error;
    }
  }

  getNextArrivalsForStop(stopId, gtfsData, limit = 10) {
    if (!gtfsData.stopTimes || !Array.isArray(gtfsData.stopTimes)) {
      console.error('stopTimes not loaded or invalid');
      return [];
    }

    const arrivals = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0].replace(/-/g, '');

    console.log(`[RT DEBUG] Looking for arrivals at stop: ${stopId}`);
    let matchingStops = 0;

    gtfsData.stopTimes.forEach(stopTime => {
      if (stopTime.stop_id !== String(stopId)) return;
      
      matchingStops++;

      const tripId = stopTime.trip_id;
      const trip = gtfsData.trips[tripId];
      if (!trip) return;

      const service = gtfsData.services[trip.service_id];
      if (!service || !this.isServiceActive(service, todayStr, now)) return;

      const scheduledTime = this.parseTime(stopTime.arrival_time || stopTime.departure_time);
      if (!scheduledTime || scheduledTime < now) return;

      const stopSequence = parseInt(stopTime.stop_sequence);
      const delays = this.tripDelays.get(tripId);
      const delay = delays?.get(stopSequence) || 0;

      const actualTime = new Date(scheduledTime.getTime() + delay * 1000);
      
      if (actualTime < now) return;

      const route = gtfsData.routes[trip.route_id];
      
      arrivals.push({
        tripId,
        routeId: trip.route_id,
        routeName: route?.route_short_name || route?.route_long_name || 'Line',
        headsign: trip.trip_headsign || '',
        arrivalTime: Math.floor(actualTime.getTime() / 1000),
        arrivalTimeFormatted: actualTime.toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        minutesUntil: Math.floor((actualTime - now) / 60000),
        delay: delay
      });
    });

    console.log(`[RT DEBUG] Found ${matchingStops} stop_times for stop ${stopId}, ${arrivals.length} valid arrivals`);

    return arrivals
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
      .slice(0, limit);
  }

  parseTime(timeStr) {
    if (!timeStr) return null;
    
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const now = new Date();
    let time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours % 24, minutes, seconds || 0);
    
    if (hours >= 24) {
      time.setDate(time.getDate() + 1);
    }
    
    if (time < now && hours < 24) {
      time.setDate(time.getDate() + 1);
    }
    
    return time;
  }

  isServiceActive(service, dateStr, date) {
    if (service.start_date && dateStr < service.start_date) return false;
    if (service.end_date && dateStr > service.end_date) return false;
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    
    if (service[dayName] !== '1') return false;
    
    if (service.exceptions && service.exceptions[dateStr] === 2) return false;
    if (service.exceptions && service.exceptions[dateStr] === 1) return true;
    
    return true;
  }
}