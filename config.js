const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search.php'

module.exports = {
  MONGODB_URI,
  JWT_SECRET,
  NOMINATIM_URL
}
