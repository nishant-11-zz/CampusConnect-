/**
 * Generate OpenStreetMap URL with latitude and longitude markers
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string} OpenStreetMap URL
 */
const getMapUrl = (latitude, longitude) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
};

/**
 * Safely return 360° photo link from department
 * @param {string} photo360Link
 * @returns {string|null} Valid link or null
 */
const get360Link = (photo360Link) => {
  if (photo360Link && typeof photo360Link === 'string' && photo360Link.trim().startsWith('http')) {
    return photo360Link.trim();
  }
  return null;
};

module.exports = {
  getMapUrl,
  get360Link
};