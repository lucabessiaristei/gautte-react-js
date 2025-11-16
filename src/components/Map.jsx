import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CONFIG } from "../utils/config";
import { PolylineOffset } from "../utils/polylineOffset";
import { createRoot } from "react-dom/client";
import StopPopup from "./StopPopup";
import { loadStopTimes } from "../hooks/useGTFSData";

function TransitMap(props) {
	const { gtfsData, setGtfsData, selectedDate, selectedTime, onShowCloseLine, onStopSelect, onMapReady  } = props || {};

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

	if (!gtfsData) {
		return <div className="w-full h-screen flex items-center justify-center">Waiting for data...</div>;
	}

	// Check if essential data is loaded
	const missingData = [];
	if (!gtfsData.stops) missingData.push("stops");
	if (!gtfsData.routes) missingData.push("routes");
	if (!gtfsData.trips) missingData.push("trips");
	if (!gtfsData.services) missingData.push("services");
	if (!gtfsData.shapes) missingData.push("shapes");

	if (missingData.length > 0) {
		console.log("Map waiting for:", missingData);
		return <div className="w-full h-screen flex items-center justify-center">Loading GTFS data... (waiting for: {missingData.join(", ")})</div>;
	}

	useEffect(() => {
		if (!mapContainer.current || map.current) return;

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

		map.current.addControl(new maplibregl.NavigationControl(), "top-right");

		map.current.on("error", (e) => {
			if (e.error && e.error.message && e.error.message.includes("glyph")) {
				e.preventDefault();
			}
		});

		map.current.on("load", () => {
			console.log("Map loaded");
			setMapLoaded(true);
			setupMapLayers();
			onMapReady?.();
		});

		return () => {
			popupRoots.current.forEach((root) => root.unmount());
			if (map.current) {
				map.current.remove();
				map.current = null;
			}
		};
	}, []);

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
				"circle-radius": ["interpolate", ["linear"], ["get", "point_count"], 1, 18, 50, 30],
				"circle-color": ["interpolate", ["linear"], ["get", "point_count"], 1, "#5a6fb3", 50, "#1d3a78"],
				"circle-stroke-width": 0,
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

		const layersOrder = map.current.getStyle().layers.map((l) => l.id);
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

	function showStopPopup(coordinates, stopId) {
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

		root.render(
			<StopPopup
				stop={stop}
				activeRoutes={[]}
				gtfsData={gtfsData}
				onRouteSelect={(routeId) => showRoute(stopId, routeId)}
				currentVisibleRouteId={currentVisibleRouteId}
				loading={true}
			/>
		);

		loadStopTimes(stopId, gtfsData, setGtfsData).then(stopTimes => {
			const activeRoutes = getActiveRoutesForStop(stopId, stopTimes);
			root.render(
				<StopPopup
					stop={stop}
					activeRoutes={activeRoutes}
					gtfsData={gtfsData}
					onRouteSelect={(routeId) => showRoute(stopId, routeId)}
					currentVisibleRouteId={currentVisibleRouteId}
					loading={false}
				/>
			);
		});

		popup.on("close", () => {
			const root = popupRoots.current.get(stopId);
			if (root) {
				root.unmount();
				popupRoots.current.delete(stopId);
			}
		});
	}

	function getActiveRoutesForStop(stopId, stopTimes) {
		if (!stopTimes || !Array.isArray(stopTimes)) {
			console.warn("stopTimes not provided, cannot determine active routes");
			return [];
		}

		const dateToUse = selectedDate || new Date().toISOString().split("T")[0];
		const timeToUse = selectedTime || new Date().toTimeString().slice(0, 5);

		const todayStr = dateToUse.replace(/-/g, "");
		const [hours, minutes] = timeToUse.split(":").map(Number);
		const currentTimeInSeconds = hours * 3600 + minutes * 60;

		const dateObj = new Date(dateToUse);
		const routeSet = new Set();

		stopTimes.forEach((stopTime) => {
			if (stopTime.stop_id !== String(stopId)) return;

			const trip = gtfsData.trips[stopTime.trip_id];
			if (!trip) return;

			const service = gtfsData.services[trip.service_id];
			if (!service || !isServiceActive(service, todayStr, dateObj)) return;

			const arrivalTime = stopTime.arrival_time || stopTime.departure_time;
			if (!arrivalTime) return;

			const [stopHours, stopMinutes, stopSeconds] = arrivalTime.split(":").map(Number);
			const stopTimeInSeconds = (stopHours % 24) * 3600 + stopMinutes * 60 + (stopSeconds || 0);

			if (stopHours >= 24 || stopTimeInSeconds >= currentTimeInSeconds) {
				routeSet.add(trip.route_id);
			}
		});

		return Array.from(routeSet);
	}

	function isServiceActive(service, dateStr, date) {
		if (service.start_date && dateStr < service.start_date) return false;
		if (service.end_date && dateStr > service.end_date) return false;

		const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		const dayName = dayNames[date.getDay()];

		if (service[dayName] !== "1") return false;

		if (service.exceptions && service.exceptions[dateStr] === 2) return false;
		if (service.exceptions && service.exceptions[dateStr] === 1) return true;

		return true;
	}

	async function showRoute(stopId, routeId) {
		clearRoutes();
		currentVisibleRouteRef.current = routeId;
		currentVisibleStopRef.current = stopId;
		setCurrentVisibleRouteId(routeId);
		setCurrentVisibleStopId(stopId);

		const dateToUse = selectedDate || new Date().toISOString().split("T")[0];
		const todayStr = dateToUse.replace(/-/g, "");
		const dateObj = new Date(dateToUse);

		console.log(`Showing route ${routeId}, date: ${dateToUse}`);

		const activeTripsToday = Object.values(gtfsData.trips).filter((trip) => {
			if (trip.route_id !== routeId) return false;
			const service = gtfsData.services[trip.service_id];
			return service && isServiceActive(service, todayStr, dateObj);
		});

		console.log(`Found ${activeTripsToday.length} trips active today for route ${routeId}`);

		const shapesByDirection = { 0: new Set(), 1: new Set() };
		activeTripsToday.forEach((trip) => {
			const direction = trip.direction_id || "0";
			const shapeId = trip.shape_id;
			if (shapeId && gtfsData.shapes[shapeId]) {
				shapesByDirection[direction].add(shapeId);
			}
		});

		console.log("Unique shapes by direction:", {
			0: Array.from(shapesByDirection["0"]),
			1: Array.from(shapesByDirection["1"]),
		});

		// Get list of stops for this route from routeStops mapping
		const stopsForRoute = gtfsData.routeStops?.[routeId] || [];
		console.log(`Route ${routeId} has ${stopsForRoute.length} stops`);

		const allStops = new Set();
		const stopDirections = new Map();
		const activeTripIds = new Set(activeTripsToday.map((t) => t.trip_id));

		// Load stop_times for each stop in the route (in batches)
		const BATCH_SIZE = 10;
		for (let i = 0; i < stopsForRoute.length; i += BATCH_SIZE) {
			const batch = stopsForRoute.slice(i, i + BATCH_SIZE);
			
			await Promise.all(
				batch.map(async (sid) => {
					try {
						const stopTimes = gtfsData.stopTimesCache[sid] || await loadStopTimes(sid, gtfsData, setGtfsData);
						
						stopTimes.forEach(st => {
							if (activeTripIds.has(st.trip_id)) {
								const trip = gtfsData.trips[st.trip_id];
								const direction = trip?.direction_id || "0";
								
								allStops.add(st.stop_id);
								if (!stopDirections.has(st.stop_id)) {
									stopDirections.set(st.stop_id, new Set());
								}
								stopDirections.get(st.stop_id).add(direction);
							}
						});
					} catch (e) {
						console.warn(`Could not load stop_times for stop ${sid}:`, e);
					}
				})
			);
		}

		console.log(`Loaded stop_times, found ${allStops.size} active stops for route ${routeId}`);

		// Draw shapes
		const newActiveRoutes = [];
		["0", "1"].forEach((direction) => {
			const shapesForDirection = Array.from(shapesByDirection[direction]);
			shapesForDirection.forEach((shapeId) => {
				const mockTrip = { shape_id: shapeId, route_id: routeId };
				const routeLayerId = drawRouteShape(mockTrip, direction);
				if (routeLayerId) {
					newActiveRoutes.push(routeLayerId);
					console.log(`Drew shape ${shapeId} for direction ${direction}`);
				}
			});
		});

		activeRoutesRef.current = newActiveRoutes;
		setActiveRoutes(newActiveRoutes);
		updateVisibleStops(allStops, stopDirections);
		toggleClustering(false);
		onShowCloseLine?.(true);
	}

	function drawRouteShape(trip, direction) {
		if (!map.current || !gtfsData.shapes[trip.shape_id]) return null;

		const coordinates = gtfsData.shapes[trip.shape_id];
		const lineCoordinates = coordinates.map((coord) => [coord[1], coord[0]]);
		const offset = -0.00004;
		const offsetCoordinates = PolylineOffset.offsetLine(lineCoordinates, offset);
		const routeId = `route-${trip.route_id}-${trip.shape_id}-${direction}`;
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

		map.current.addLayer(
			{
				id: routeId,
				type: "line",
				source: routeId,
				layout: { "line-join": "round", "line-cap": "round" },
				paint: { "line-color": color, "line-width": 4, "line-opacity": 0.85 },
			},
			"stops-nocluster-layer"
		);

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

	useEffect(() => {
		if (gtfsData?.stops && mapLoaded && map.current?.getSource("stops")) {
			createStopMarkers();
		}
	}, [gtfsData?.stops, mapLoaded]);

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

	// Re-render open popups when currentVisibleRouteId changes
	useEffect(() => {
		popupRoots.current.forEach((root, stopId) => {
			const stop = gtfsData.stops[stopId];
			if (!stop) return;

			const stopTimes = gtfsData.stopTimesCache?.[stopId];
			if (!stopTimes) return;

			const activeRoutes = getActiveRoutesForStop(stopId, stopTimes);

			root.render(
				<StopPopup
					stop={stop}
					activeRoutes={activeRoutes}
					gtfsData={gtfsData}
					onRouteSelect={(routeId) => showRoute(stopId, routeId)}
					currentVisibleRouteId={currentVisibleRouteId}
				/>
			);
		});
	}, [currentVisibleRouteId]);

	return (
		<>
			<div ref={mapContainer} className="w-full h-full rounded-2xl" />
		</>
	);
}

export default TransitMap;