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

  async getNextArrivalsForStop(stopId, gtfsData, limit = 10) {
    const arrivals = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0].replace(/-/g, '');

    let stopTimes = [];
    
    // Try to load split file first
    try {
      const response = await fetch(`/public_data/stop_times/${stopId}.txt`);
      if (response.ok) {
        const text = await response.text();
        stopTimes = this.parseStopTimesCSV(text);
        console.log(`✅ Loaded ${stopTimes.length} stop_times for stop ${stopId}`);
      }
    } catch (error) {
      console.warn(`Could not load split file for stop ${stopId}, falling back to full data`);
      // Fallback to full stop_times if available
      if (gtfsData.stopTimes && Array.isArray(gtfsData.stopTimes)) {
        stopTimes = gtfsData.stopTimes.filter(st => st.stop_id === String(stopId));
      }
    }

    stopTimes.forEach(stopTime => {

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

    // console.log('Found', arrivals.length, 'arrivals for stop', stopId);

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

  parseStopTimesCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.replace(/"/g, '') || '';
      });
      
      data.push(row);
    }
    
    return data;
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