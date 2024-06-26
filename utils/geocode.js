const axios = require('axios');
const config = require('../config/config');

const getCoordinates = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${config.googleMapsApiKey}`
    );
    const location = response.data.results[0].geometry.location;
    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
};

module.exports = getCoordinates;
