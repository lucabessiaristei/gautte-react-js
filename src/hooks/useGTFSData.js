import { useState, useEffect } from 'react';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const data = {};
  
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
    
    // Use appropriate ID as key
    const id = row.trip_id || row.stop_id || row.route_id || row.service_id || row.shape_id || i;
    data[id] = row;
  }
  
  return data;
}

function parseCSVArray(text) {
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

export function useGTFSData() {
  const [gtfsData, setGtfsData] = useState({
    stops: null,
    routes: null,
    trips: null,
    services: null,
    shapes: null,
    stopTimes: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load stops
        const stopsText = await fetch('/public_data/stops.txt').then(r => r.text());
        const stops = parseCSV(stopsText);
        
        // Load routes
        const routesText = await fetch('/public_data/routes.txt').then(r => r.text());
        const routes = parseCSV(routesText);
        
        // Load trips
        const tripsText = await fetch('/public_data/trips.txt').then(r => r.text());
        const trips = parseCSV(tripsText);
        
        // Load calendar (services)
        const calendarText = await fetch('/public_data/calendar.txt').then(r => r.text());
        const services = parseCSV(calendarText);
        
        // Load calendar_dates for exceptions
        try {
          const calendarDatesText = await fetch('/public_data/calendar_dates.txt').then(r => r.text());
          const calendarDates = parseCSVArray(calendarDatesText);
          
          calendarDates.forEach(exception => {
            const serviceId = exception.service_id;
            if (services[serviceId]) {
              if (!services[serviceId].exceptions) {
                services[serviceId].exceptions = {};
              }
              services[serviceId].exceptions[exception.date] = parseInt(exception.exception_type);
            }
          });
        } catch (e) {
          console.warn('calendar_dates.txt not found or error loading');
        }
        
        // Load shapes
        const shapesText = await fetch('/public_data/shapes.txt').then(r => r.text());
        const shapesArray = parseCSVArray(shapesText);
        
        const shapes = {};
        shapesArray.forEach(point => {
          const shapeId = point.shape_id;
          if (!shapes[shapeId]) {
            shapes[shapeId] = [];
          }
          shapes[shapeId].push([
            parseFloat(point.shape_pt_lat),
            parseFloat(point.shape_pt_lon)
          ]);
        });
        
        // Load stop_times - this is the key file!
        const stopTimesText = await fetch('/public_data/stop_times.txt').then(r => r.text());
        const stopTimes = parseCSVArray(stopTimesText);
        
        console.log('Loaded GTFS data:', {
          stops: Object.keys(stops).length,
          routes: Object.keys(routes).length,
          trips: Object.keys(trips).length,
          services: Object.keys(services).length,
          shapes: Object.keys(shapes).length,
          stopTimes: stopTimes.length
        });
        
        setGtfsData({ stops, routes, trips, services, shapes, stopTimes });
        setLoading(false);
      } catch (err) {
        console.error('Error loading GTFS data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { gtfsData, loading, error };
}