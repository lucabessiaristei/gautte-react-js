import liberty from '../assets/liberty.json';

export const CONFIG = {
  INITIAL_CENTER: [7.69, 45.07],
  INITIAL_ZOOM: 15,
  MIN_ZOOM: 10,
  MAX_ZOOM: 19,
  CLUSTER_RADIUS: 50,
  CLUSTER_MAX_ZOOM: 16,
  ROUTE_COLORS: {
    direction0: '#c84949',
    direction1: '#2b70cb'
  },
  STOP_COLORS: {
    default: '#666666',
    direction0: '#c84949',
    direction1: '#2b70cb',
    both: '#9c27b0',
    unavailable: '#cccccc'
  },
  MAP_STYLE: liberty
};