const { UserInputError, AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const { distance, point } = require('@turf/turf');
const axios = require('axios')

const { JWT_SECRET, NOMINATIM_URL } = require('../config')
const User = require('../models/user');
const Apartment = require('../models/apartment');

module.exports = {
  Query: {
    me: (root, args, { currentUser }) => {
      return currentUser;
    },
    allApartments: (root, args) => {
      let filter = {}
      if (args.city) {
        filter = { city:  args.city };
      } else if (args.country) {
        filter = { country: args.country };
      } else if (args.rooms) {
        filter = { rooms: args.rooms };
      }
      return Apartment.find(filter);
    },
    allFavorites: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Authentication required');
      }
      const user =  await User.findById(currentUser.id).populate('favorites', { name: 1 });
      return user.favorites.map(f => f.name);
    },
    nearestApartment: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Authentication required');
      }

      let apartmentsDistance = {};

      for (const apartment of await Apartment.find({})) {
        const address = `${apartment.address},${apartment.city},${apartment.country}`;
        const { data: res } = await axios.get(`${NOMINATIM_URL}?q=${address}&polygon_geojson=1&format=jsonv2`);
        const { lon, lat } = res[0];
        const from = point([lon, lat]);
        const to = point([args.locationX, args.locationY]);
        const distKm = distance(from, to);

        if (distKm <= args.distance) {
          apartmentsDistance[apartment.name] = distKm;
        }
      }

      let apartment;
      if (apartmentsDistance) {
        apartment = Object.entries(apartmentsDistance).reduce((a, b) => {
          const { firstKey, firstValue } = a
          const { secondKey, secondValue } = b

          if (firstValue < secondValue) return b;
          return a;
        })

        if (apartment) {
          return Apartment.find({ name: apartment[0] });
        }
      }
    }
  },
  Mutation: {
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
      });
      try {
        return user.save();
      } catch (error) {
        throw new UserInputError( error.message, {
          invalidArgs: args,
        });
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== 'secret') {
        throw new UserInputError('Wrong credentials');
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
    addApartment: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Authentication required');
      }

      const apartment = new Apartment({ ...args });
      apartment.owner = currentUser

      try {
        await apartment.save();
      } catch (error) {
        throw new UserInputError( error.message, {
          invalidArgs: args,
        });
      }
      return apartment;
    },
    markAsFavorite: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Authentication required');
      }

      try {
        const apartment = await Apartment.findOne({ name: args.name });
        currentUser.favorites.push(apartment._id);
        await currentUser.save()
      } catch (error) {
        throw new UserInputError( error.message, {
          invalidArgs: args,
        });
      }
      return currentUser
    }
  }
};