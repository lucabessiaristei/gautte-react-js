import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CONFIG } from "../utils/config";
import { PolylineOffset } from "../utils/polylineOffset";
import { createRoot } from "react-dom/client";
import StopPopup from "./StopPopup";

function TransitMap(props) {
	const { gtfsData, selectedDate, selectedTime, onShowCloseLine, onStopSelect } = props || {};

	const mapContainer = useRef(null);
	const map = useRef(null);
	const popupRoots = useRef(new Map());
	const [activeRoutes, setActiveRoutes] = useState([]);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [currentVisibleRouteId, setCurrentVisibleRouteId] = useState(null);
	const [currentVisibleStopId, setCurrentVisibleStopId] = useState(null);
	const currentVisibleRouteRef = useRef(null);
	const currentVisibleStopRef = useRef(null);
	const activeRoutesRef = useRef([]);
	const [tripStopsIndex, setTripStopsIndex] = useState(null);
	const [indexLoading, setIndexLoading] = useState(true);

	// Load trip index
	useEffect(() => {
		const loadIndex = async () => {
			console.log('⏳ Loading trip→stops index (15MB, cached after first load)...');
			try {
				const response = await fetch('/public_data/trip_stops_index.json');
				const index = await response.json();
				setTripStopsIndex(index);
				setIndexLoading(false);
				console.log('✅ Loaded trip→stops index with', Object.keys(index).length, 'trips');
			} catch (error) {
				console.error('❌ Failed to load trip index:', error);
				setIndexLoading(false);
			}
		};
		loadIndex();
	}, []);

	// Initialize map
	useEffect(() => {
		if (!mapContainer.current || map.current || !gtfsData || indexLoading) return;

		map.current = new maplibregl.Map({
			container: mapContainer.current,
			style: CONFIG.MAP_STYLE,
			center: CONFIG.INITIAL_CENTER,
			zoom: CONFIG.INITIAL_ZOOM,
			minZoom: CONFIG.MIN_ZOOM,
			maxZoom: CONFIG.MAX_ZOOM,
			attributionControl: false,
		});

		map.current.addControl(
			new maplibregl.AttributionControl({
				customAttribution: [
					'<a href="https://maplibre.org/" target="_blank">MapLibre</a>',
					'GTFS data: <a href="http://aperto.comune.torino.it/" target="_blank">AperTO - Comune di Torino</a>',
					'by <a href="https://lucabessiaristei.it" target="_blank">Luca Bessi Aristei</a>',
				].join(" | "),
				compact: true,
			}),
			"bottom-right"
		);

		map.current.addControl(new maplibregl.NavigationControl(), "bottom-left");

		map.current.on("error", (e) => {
			if (e.error && e.error.message && e.error.message.includes("glyph")) {
				e.preventDefault();
			}
		});

		map.current.on("load", () => {
			console.log("Map loaded");
			setMapLoaded(true);
			setupMapLayers();
		});

		return () => {
			popupRoots.current.forEach((root) => root.unmount());
			if (map.current) {
				map.current.remove();
				map.current = null;
			}
		};
	}, [gtfsData, indexLoading]);

	// Create stop markers when data is ready
	useEffect(() => {
		if (gtfsData?.stops && mapLoaded && map.current?.getSource("stops")) {
			createStopMarkers();
		}
	}, [gtfsData?.stops, mapLoaded]);

	// Setup window actions
	useEffect(() => {
		window.mapActions = {
			resetView: () => {
				clearRoutes();
				createStopMarkers();
				onShowCloseLine?.(false);
				map.current?.flyTo({ center: CONFIG.INITIAL_CENTER, zoom: CONFIG.INITIAL_ZOOM });
			},
			locateUser: () => {
				if (!navigator.geolocation) return alert("Geolocation not supported");
				navigator.geolocation.getCurrentPosition(
					(pos) => {
						const { latitude, longitude } = pos.coords;
						if (map.current.getLayer("user-location")) {
							map.current.removeLayer("user-location");
							map.current.removeSource("user-location");
						}
						map.current.addSource("user-location", {
							type: "geojson",
							data: { type: "Feature", geometry: { type: "Point", coordinates: [longitude, latitude] } },
						});
						map.current.addLayer({
							id: "user-location",
							type: "circle",
							source: "user-location",
							paint: { "circle-radius": 10, "circle-color": "#4285f4", "circle-stroke-color": "#fff", "circle-stroke-width": 2 },
						});
						map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
					},
					(err) => alert(`Geolocation error: ${err.message}`)
				);
			},
			closeLine: () => {
				closeAllPopups();
				clearRoutes();
				createStopMarkers();
				onShowCloseLine?.(false);
				if (typeof window.closeArrivals === "function") {
					window.closeArrivals();
				}
			},
		};
	}, [activeRoutes, gtfsData, mapLoaded, selectedDate, selectedTime]);

	if (!gtfsData || indexLoading) {
		return (
			<div className="w-full h-screen flex flex-col items-center justify-center gap-4">
				<div className="text-xl text-gray-600">
					{!gtfsData ? 'Loading map data...' : 'Loading route index...'}
				</div>
				{indexLoading && (
					<div className="text-sm text-gray-500">
						(15MB - cached after first load)
					</div>
				)}
			</div>
		);
	}

	function setupMapLayers() {
		if (!map.current) return;

		map.current.addSource("stops", {
			type: "geojson",
			data: { type: "FeatureCollection", features: [] },
			cluster: true,
			clusterMaxZoom: CONFIG.CLUSTER_MAX_ZOOM,
			clusterRadius: CONFIG.CLUSTER_RADIUS,
		});

		map.current.addSource("stops-nocluster", {
			type: "geojson",
			data: { type: "FeatureCollection", features: [] },
			cluster: false,
		});

		map.current.addLayer({
			id: "clusters",
			type: "circle",
			source: "stops",
			filter: ["has", "point_count"],
			paint: {
				"circle-color": ["step", ["get", "point_count"], "#51bbd6", 10, "#f1f075", 30, "#f28cb1"],
				"circle-radius": ["step", ["get", "point_count"], 20, 10, 25, 30, 30],
				"circle-stroke-width": 2,
				"circle-stroke-color": "#fff",
			},
		});

		map.current.addLayer({
			id: "cluster-count",
			type: "symbol",
			source: "stops",
			filter: ["has", "point_count"],
			layout: {
				"text-field": "{point_count_abbreviated}",
				"text-size": 12,
			},
			paint: { "text-color": "#fff" },
		});

		map.current.addLayer({
			id: "unclustered-stops",
			type: "circle",
			source: "stops",
			filter: ["!", ["has", "point_count"]],
			paint: {
				"circle-color": ["get", "color"],
				"circle-radius": 8,
				"circle-stroke-width": 2,
				"circle-stroke-color": "#fff",
			},
		});

		map.current.addLayer({
			id: "stops-nocluster-layer",
			type: "circle",
			source: "stops-nocluster",
			paint: {
				"circle-color": ["get", "color"],
				"circle-radius": 8,
				"circle-stroke-width": 2,
				"circle-stroke-color": "#fff",
			},
			layout: { visibility: "none" },
		});

		const layersOrder = map.current.getStyle().layers.map(l => l.id);
		if (layersOrder.includes("clusters")) {
			map.current.moveLayer("clusters");
		}
		if (layersOrder.includes("cluster-count")) {
			map.current.moveLayer("cluster-count");
		}

		map.current.on("click", "clusters", handleClusterClick);
		map.current.on("click", "unclustered-stops", handleStopClick);
		map.current.on("click", "stops-nocluster-layer", handleStopClick);
		map.current.on("mouseenter", "clusters", () => (map.current.getCanvas().style.cursor = "pointer"));
		map.current.on("mouseleave", "clusters", () => (map.current.getCanvas().style.cursor = ""));
		map.current.on("mouseenter", "unclustered-stops", () => (map.current.getCanvas().style.cursor = "pointer"));
		map.current.on("mouseleave", "unclustered-stops", () => (map.current.getCanvas().style.cursor = ""));
		map.current.on("mouseenter", "stops-nocluster-layer", () => (map.current.getCanvas().style.cursor = "pointer"));
		map.current.on("mouseleave", "stops-nocluster-layer", () => (map.current.getCanvas().style.cursor = ""));
	}

	function toggleClustering(enabled) {
		if (!map.current) return;

		if (!enabled) {
			map.current.setLayoutProperty("clusters", "visibility", "none");
			map.current.setLayoutProperty("cluster-count", "visibility", "none");
			map.current.setLayoutProperty("unclustered-stops", "visibility", "none");
			map.current.setLayoutProperty("stops-nocluster-layer", "visibility", "visible");
			return;
		}

		map.current.setLayoutProperty("clusters", "visibility", "visible");
		map.current.setLayoutProperty("cluster-count", "visibility", "visible");
		map.current.setLayoutProperty("unclustered-stops", "visibility", "visible");
		map.current.setLayoutProperty("stops-nocluster-layer", "visibility", "none");
	}

	function handleClusterClick(e) {
		const features = map.current.queryRenderedFeatures(e.point, { layers: ["clusters"] });
		if (!features.length) return;

		const cluster = features[0];
		const currentZoom = map.current.getZoom();

		map.current.easeTo({
			center: cluster.geometry.coordinates,
			zoom: Math.min(currentZoom + 2, CONFIG.MAX_ZOOM),
			duration: 600,
		});
	}

	function handleStopClick(e) {
		const coordinates = e.features[0].geometry.coordinates.slice();
		const stopId = e.features[0].properties.stopId;
		
		const stop = gtfsData.stops[stopId];
		if (stop && onStopSelect) {
			onStopSelect(stop);
		}
		showStopPopup(coordinates, stopId);
	}

	async function showStopPopup(coordinates, stopId) {
		const stop = gtfsData.stops[stopId];
		if (!stop) return;

		const popupNode = document.createElement("div");

		const popup = new maplibregl.Popup({
			closeButton: true,
			closeOnClick: true,
			maxWidth: "300px",
			className: "custom-popup",
		})
			.setLngLat(coordinates)
			.setDOMContent(popupNode)
			.addTo(map.current);

		const root = createRoot(popupNode);
		popupRoots.current.set(stopId, root);

		// Show loading state first
		root.render(
			<StopPopup
				stop={stop}
				activeRoutes={[]}
				gtfsData={gtfsData}
				onRouteSelect={(routeId) => showRoute(stopId, routeId)}
				currentVisibleRouteId={currentVisibleRouteRef.current}
				loading={true}
			/>
		);

		// Load active routes
		const activeRoutes = await getActiveRoutesForStop(stopId);

		// Update with actual routes
		root.render(
			<StopPopup
				stop={stop}
				activeRoutes={activeRoutes}
				gtfsData={gtfsData}
				onRouteSelect={(routeId) => showRoute(stopId, routeId)}
				currentVisibleRouteId={currentVisibleRouteRef.current}
				loading={false}
			/>
		);

		popup.on("close", () => {
			const root = popupRoots.current.get(stopId);
			if (root) {
				root.unmount();
				popupRoots.current.delete(stopId);
			}
		});
	}

	function parseStopTimesCSV(text) {
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

	async function getActiveRoutesForStop(stopId) {
		const now = new Date();
		const todayStr = now.toISOString().split('T')[0].replace(/-/g, '');
		const routeSet = new Set();

		let stopTimes = [];

		// Load split file for this stop
		try {
			const response = await fetch(`/public_data/stop_times/${stopId}.txt`);
			if (response.ok) {
				const text = await response.text();
				stopTimes = parseStopTimesCSV(text);
			}
		} catch (error) {
			console.warn(`Could not load stop_times for stop ${stopId}`);
			return [];
		}

		stopTimes.forEach(stopTime => {

			const trip = gtfsData.trips[stopTime.trip_id];
			if (!trip) return;

			const service = gtfsData.services[trip.service_id];
			if (!service || !isServiceActive(service, todayStr, now)) return;

			routeSet.add(trip.route_id);
		});

		return Array.from(routeSet);
	}

	function isServiceActive(service, dateStr, date) {
		if (service.start_date && dateStr < service.start_date) return false;
		if (service.end_date && dateStr > service.end_date) return false;
		
		const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
		const dayName = dayNames[date.getDay()];
		
		if (service[dayName] !== '1') return false;
		
		if (service.exceptions && service.exceptions[dateStr] === 2) return false;
		if (service.exceptions && service.exceptions[dateStr] === 1) return true;
		
		return true;
	}

	async function getStopsForTripFromFiles(tripId) {
		// Instead of loading huge index, we'll check a representative sample of stops
		// This is not perfect but much faster than loading 14MB index
		
		// Strategy: use the shape to know approximately which stops to check
		const trip = gtfsData.trips[tripId];
		if (!trip || !gtfsData.shapes[trip.shape_id]) {
			return [];
		}
		
		// Get all stop IDs
		const allStopIds = Object.keys(gtfsData.stops);
		const foundStops = [];
		
		// Load stop_times files in parallel (limit to avoid overwhelming)
		const batchSize = 20;
		for (let i = 0; i < allStopIds.length; i += batchSize) {
			const batch = allStopIds.slice(i, i + batchSize);
			const promises = batch.map(async stopId => {
				try {
					const response = await fetch(`/public_data/stop_times/${stopId}.txt`);
					if (!response.ok) return null;
					
					const text = await response.text();
					// Quick check: does this file contain our tripId?
					if (text.includes(tripId)) {
						return stopId;
					}
				} catch {
					return null;
				}
				return null;
			});
			
			const results = await Promise.all(promises);
			results.forEach(stopId => {
				if (stopId) foundStops.push(stopId);
			});
			
			// Early exit if we found enough stops
			if (foundStops.length > 50) break;
		}
		
		console.log(`Found ${foundStops.length} stops for trip ${tripId}`);
		return foundStops;
	}

	function showRoute(stopId, routeId) {
		clearRoutes();
		currentVisibleRouteRef.current = routeId;
		currentVisibleStopRef.current = stopId;
		setCurrentVisibleRouteId(routeId);
		setCurrentVisibleStopId(stopId);

		const now = new Date();
		const todayStr = now.toISOString().split('T')[0].replace(/-/g, '');
		
		const routeTrips = Object.values(gtfsData.trips).filter(
			trip => trip.route_id === routeId && isServiceActive(gtfsData.services[trip.service_id], todayStr, now)
		);

		const tripsByDirection = {};
		routeTrips.forEach(trip => {
			const direction = trip.direction_id || "0";
			if (!tripsByDirection[direction]) {
				tripsByDirection[direction] = trip;
			}
		});

		console.log('Route', routeId, 'has', routeTrips.length, 'trips');
routeTrips.forEach(t => {
  console.log('Trip', t.trip_id, 'direction', t.direction_id, 'shape', t.shape_id);
});

		const newActiveRoutes = [];

		// Draw route shapes immediately
		Object.entries(tripsByDirection).forEach(([direction, trip]) => {
			const routeLayerId = drawRouteShape(trip, direction);
			if (routeLayerId) newActiveRoutes.push(routeLayerId);
		});

		activeRoutesRef.current = newActiveRoutes;
		setActiveRoutes(newActiveRoutes);
		toggleClustering(false);
		onShowCloseLine?.(true);

		// Load stops asynchronously
		loadStopsForRoute(tripsByDirection);
	}

	async function loadStopsForRoute(tripsByDirection) {
		if (!tripStopsIndex) {
			console.warn('⚠️ Index not loaded yet');
			return;
		}

		const allStops = new Set();
		const stopDirections = new Map();

		// Get stops instantly from index
		for (const [direction, trip] of Object.entries(tripsByDirection)) {
			const tripStops = tripStopsIndex[trip.trip_id] || [];
			
			tripStops.forEach(stopId => {
				allStops.add(stopId);
				if (!stopDirections.has(stopId)) {
					stopDirections.set(stopId, new Set());
				}
				stopDirections.get(stopId).add(direction);
			});
		}

		updateVisibleStops(allStops, stopDirections);
		console.log(`✅ Showing ${allStops.size} stops instantly from index`);
	}

	function drawRouteShape(trip, direction) {
		if (!map.current || !gtfsData.shapes[trip.shape_id]) return null;

		const coordinates = gtfsData.shapes[trip.shape_id];
		const lineCoordinates = coordinates.map((coord) => [coord[1], coord[0]]);
		const offset = -0.00004;
		const offsetCoordinates = PolylineOffset.offsetLine(lineCoordinates, offset);
		const routeId = `route-${trip.route_id}-${direction}`;
		const color = direction === "0" ? CONFIG.ROUTE_COLORS.direction0 : CONFIG.ROUTE_COLORS.direction1;

		if (map.current.getSource(routeId)) {
			map.current.removeLayer(routeId);
			map.current.removeSource(routeId);
		}

		map.current.addSource(routeId, {
			type: "geojson",
			data: {
				type: "Feature",
				properties: {},
				geometry: { type: "LineString", coordinates: offsetCoordinates },
			},
		});

		map.current.addLayer({
			id: routeId,
			type: "line",
			source: routeId,
			layout: { "line-join": "round", "line-cap": "round" },
			paint: { "line-color": color, "line-width": 4, "line-opacity": 0.85 },
		});

		return routeId;
	}

	function updateVisibleStops(lineStops, stopDirections) {
		const features = Object.values(gtfsData.stops)
			.filter((stop) => lineStops.has(stop.stop_id))
			.map((stop) => {
				const directions = stopDirections.get(stop.stop_id);
				let color = CONFIG.STOP_COLORS.default;

				if (directions) {
					if (directions.has("0") && directions.has("1")) color = CONFIG.STOP_COLORS.both;
					else if (directions.has("0")) color = CONFIG.STOP_COLORS.direction0;
					else if (directions.has("1")) color = CONFIG.STOP_COLORS.direction1;
				}

				return {
					type: "Feature",
					properties: { stopId: stop.stop_id, stopName: stop.stop_name, color },
					geometry: { type: "Point", coordinates: [parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)] },
				};
			});

		map.current.getSource("stops").setData({ type: "FeatureCollection", features });
		if (map.current.getSource("stops-nocluster")) {
			map.current.getSource("stops-nocluster").setData({ type: "FeatureCollection", features });
		}
	}

	function createStopMarkers() {
		if (!gtfsData?.stops || !map.current?.getSource("stops")) return;

		const features = Object.values(gtfsData.stops).map((stop) => ({
			type: "Feature",
			properties: { stopId: stop.stop_id, stopName: stop.stop_name, color: CONFIG.STOP_COLORS.default },
			geometry: { type: "Point", coordinates: [parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)] },
		}));

		map.current.getSource("stops").setData({ type: "FeatureCollection", features });
		if (map.current.getSource("stops-nocluster")) {
			map.current.getSource("stops-nocluster").setData({ type: "FeatureCollection", features });
		}
	}

	function closeAllPopups() {
		popupRoots.current.forEach((root) => {
			const popupElements = document.getElementsByClassName("maplibregl-popup");
			for (const el of popupElements) {
				if (el && el.parentNode) el.remove();
			}
			root.unmount();
		});
		popupRoots.current.clear();
	}

	function clearRoutes() {
		if (!map.current) return;

		activeRoutesRef.current.forEach((routeId) => {
			if (map.current.getLayer(routeId)) map.current.removeLayer(routeId);
			if (map.current.getSource(routeId)) map.current.removeSource(routeId);
		});

		activeRoutesRef.current = [];
		setActiveRoutes([]);
		setCurrentVisibleRouteId(null);
		setCurrentVisibleStopId(null);
		toggleClustering(true);
	}

	return <div ref={mapContainer} className="w-full h-full rounded-2xl" />;
}

export default TransitMap;