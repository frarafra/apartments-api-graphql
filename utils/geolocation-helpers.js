const { distance, point } = require('@turf/turf');
const axios = require('axios');
const { NOMINATIM_URL } = require('../config');

const calculateDistance = async (address, toX, toY) => {
  const { data: res } = await axios.get(`${NOMINATIM_URL}?q=${address}&polygon_geojson=1&format=jsonv2`);
  const { lon, lat } = res[0];
  const from = point([lon, lat]);
  const to = point([toX, toY]);

  return  distance(from, to);
}

const getNearestApartment = (apartments) => {
  return apartments.reduce((a, b) => {
    const { firstKey, firstValue } = a
    const { secondKey, secondValue } = b

    if (firstValue < secondValue) return b;
    return a;
  })
}

module.exports = {
  calculateDistance,
  getNearestApartment
}