# GAUTTE React.JS

**Version 0.40.0-alpha** - *In Development*

Real-time transit visualization for Turin's public transport system (GTT). Interactive map with live bus arrivals, route visualization, and schedule queries.

## Status

### Working
- Interactive map with stop clustering
- Route visualization with direction colors
- Real-time arrival predictions with 30s refresh
- Date/time schedule queries
- Service calendar with exception handling
- User geolocation
- Optimized stop_times loading (3s vs 20s+)
- On-demand data loading per stop

### To Fix
- Stop popup closing behavior (UI elements remain visible)
- Trip ID matching between realtime feed and static GTFS data

## Tech Stack

React 18 • Vite • MapLibre GL JS • Tailwind CSS v4 • Phosphor Icons • GTFS Realtime

## Data Sources

**Static GTFS**: [AperTO - Comune di Torino](http://aperto.comune.torino.it/)  
**Realtime API**: GTT GTFS Realtime (30s updates)  
**Map Style**: MapLibre Liberty theme

## Project Structure

```
src/
├── components/        # Map, Sidebar, StopArrivals, StopPopup
├── hooks/            # useGTFSData
├── services/         # gtfsRealtimeService
├── utils/            # config, dateHelpers, polylineOffset, mapService
└── App.jsx

public_data/
├── stops.txt         # All stops (~7K entries)
├── routes.txt        # All routes
├── trips.txt         # All trips
├── calendar.txt      # Service schedules
├── shapes.txt        # Route geometries
└── stop_times/       # Split files (7K+ files)
    ├── 6.txt         # Stop times for stop_id 6
    ├── 7.txt         # Stop times for stop_id 7
    └── ...
```

## Key Features

**Map Component**: MapLibre integration with clustering, route shapes, stop interactions  
**Realtime Service**: Protocol Buffer parsing, delay calculations, arrival predictions  
**GTFS Processing**: CSV parsing, service calendar validation, trip filtering  
**Performance**: Multi-layered caching (localStorage, Service Worker, HTTP headers), split stop_times per stop for on-demand loading

## Configuration

Vite proxy handles CORS for GTT realtime API. Map settings (center, zoom, colors) in `src/utils/config.js`.

## Attribution

[MapLibre](https://maplibre.org/) • [AperTO](http://aperto.comune.torino.it/) • GTT • [Luca Bessi Aristei](https://lucabessiaristei.it)