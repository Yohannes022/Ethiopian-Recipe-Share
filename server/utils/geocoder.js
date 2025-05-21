const NodeGeocoder = require('node-geocoder');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Configure geocoder
const options = {
  provider: process.env.GEOCODER_PROVIDER || 'mapquest',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY || 'YOUR_MAPQUEST_API_KEY',
  formatter: null,
  // Optional: Add more provider-specific options here
  // For example, for OpenStreetMap:
  // provider: 'openstreetmap',
  // For Google Maps:
  // provider: 'google',
  // apiKey: process.env.GOOGLE_MAPS_API_KEY,
  // For Mapbox:
  // provider: 'mapbox',
  // apiKey: process.env.MAPBOX_ACCESS_TOKEN,
  // For LocationIQ:
  // provider: 'locationiq',
  // apiKey: process.env.LOCATIONIQ_API_KEY,
};

// Initialize geocoder
const geocoder = NodeGeocoder(options);

module.exports = geocoder;
