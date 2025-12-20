const fetch = require('node-fetch');

/**
 * Calculate Haversine distance between two points (in meters)
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

/**
 * Get walking route between two points using OSRM with fallback
 * @param {number} lat1 - Start latitude
 * @param {number} lon1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lon2 - End longitude
 * @returns {Promise<{ distance: number, duration: number, steps: string[], summary: string }>}
 */
const getRouteBetweenPoints = async (lat1, lon1, lat2, lon2) => {
  try {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      throw new Error('All coordinates (lat1, lon1, lat2, lon2) are required');
    }

    // OSRM demo endpoint
    const coordinates = `${lon1},${lat1};${lon2},${lat2}`;
    const url = `http://router.project-osrm.org/route/v1/walking/${coordinates}?overview=false&steps=true&geometries=geojson`;

    // Create AbortController for 5-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let data;
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OSRM responded with status ${response.status}`);
      }

      data = await response.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Routing service timeout');
      }
      throw fetchError;
    }

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    const distance = Math.round(route.distance);
    const duration = Math.round(route.duration / 60); // minutes
    const steps = route.legs[0].steps
      .map(step => step.instruction)
      .slice(0, 5);

    return {
      distance,
      duration,
      steps,
      summary: `Walk ${distance}m (${duration} min)`
    };

  } catch (error) {
    console.warn('OSRM failed, using fallback distance:', error.message);

    // FALLBACK: Approximate straight-line distance
    const distance = haversineDistance(lat1, lon1, lat2, lon2);
    const duration = Math.round(distance / 80); // 80 meters per minute walking speed

    return {
      distance,
      duration,
      steps: [`Walk approximately ${distance}m on campus paths`],
      summary: `Approximate distance: ${distance}m (${duration} min)`
    };
  }
};

module.exports = { getRouteBetweenPoints };