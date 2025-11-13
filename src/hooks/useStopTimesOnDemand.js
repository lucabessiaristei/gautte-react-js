import { useState, useCallback } from 'react';

/**
 * Hook to load stop_times data on-demand for specific stops
 * Instead of loading 130MB upfront, loads only ~50-500KB per stop
 */
export function useStopTimesOnDemand() {
  const [stopTimesCache, setStopTimesCache] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseCSVArray = (text) => {
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
  };

  const loadStopTimes = useCallback(async (stopId) => {
    if (stopTimesCache.has(stopId)) {
      return stopTimesCache.get(stopId);
    }

    setLoading(true);
    setError(null);

    try {
      const url = `/public_data/stop_times/${stopId}.txt`;
      console.log(`⏬ Loading stop_times for stop ${stopId}...`);
      const startTime = performance.now();

      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`No stop_times data for stop ${stopId}`);
          return [];
        }
        throw new Error(`Failed to load: ${response.status}`);
      }

      const text = await response.text();
      const data = parseCSVArray(text);
      
      const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
      const sizeKB = (text.length / 1024).toFixed(2);
      console.log(`✅ Loaded ${data.length} stop_times for stop ${stopId} (${sizeKB}KB in ${loadTime}s)`);

      setStopTimesCache(prev => new Map(prev).set(stopId, data));
      setLoading(false);

      return data;
    } catch (err) {
      console.error(`Error loading stop_times for stop ${stopId}:`, err);
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, [stopTimesCache]);

  const clearCache = useCallback(() => {
    setStopTimesCache(new Map());
  }, []);

  const getCachedStopTimes = useCallback((stopId) => {
    return stopTimesCache.get(stopId) || null;
  }, [stopTimesCache]);

  return {
    loadStopTimes,
    getCachedStopTimes,
    clearCache,
    loading,
    error,
    cacheSize: stopTimesCache.size
  };
}