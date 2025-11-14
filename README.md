# GAUTTE React.JS

**Version 0.30.5** - *In Development*

Real-time transit visualization for Turin's public transport system (GTT). Interactive map with live bus arrivals, route visualization, and schedule queries.

## Status

### Working
- Interactive map with stop clustering
- Route visualization with direction colors
- Real-time arrival predictions
- Date/time schedule queries
- Service calendar support
- User geolocation

### To Fix
- Stop popup closing behavior (UI elements remain visible)
- Trip ID matching between realtime feed and static GTFS data

## Tech Stack

React 18 • Vite • MapLibre GL JS • Tailwind CSS v4 • Phosphor Icons • GTFS Realtime

## Data Sources

**Static GTFS**: [AperTO - Comune di Torino](http://aperto.comune.torino.it/)  
**Realtime API**: GTT GTFS Realtime (30s updates)  
**Map Style**: MapLibre Liberty theme

## Quick Start

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/        # Map, Sidebar, StopArrivals, StopPopup
├── hooks/            # useGTFSData
├── services/         # gtfsRealtimeService
├── utils/            # config, dateHelpers, polylineOffset
└── App.jsx
```

## Key Features

**Map Component**: MapLibre integration with clustering, route shapes, stop interactions  
**Realtime Service**: Protocol Buffer parsing, delay calculations, arrival predictions  
**GTFS Processing**: CSV parsing, service calendar validation, trip filtering

## Configuration

Vite proxy handles CORS for GTT realtime API. Map settings (center, zoom, colors) in `src/utils/config.js`.

## Attribution

[MapLibre](https://maplibre.org/) • [AperTO](http://aperto.comune.torino.it/) • GTT • [Luca Bessi Aristei](https://lucabessiaristei.it)