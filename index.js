require('dotenv').config()
const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./models/user');
const Apartment = require('./models/apartment');

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET

console.log('Connecting to ', MONGODB_URI,'...');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('Connected to Mongo DB');
  })
  .catch((err) => {
    console.error('Error while connecting to Mongo DB: ', err.message);
  });

const typeDefs = gql`
  type Token {
    value: String!
  }

  type User {
    username: String!
    favorites: [String]
    id: ID!
  }

  type Apartment {
    name: String!
    address: String!
    city: String!
    country: String!
    rooms: Int!
    owner: User!
    id: ID!
  }
  
  type Query {
    me: User
    allApartments(city: String, country: String, rooms: Int): [Apartment!]!
    allFavorites: [Apartment]
  }
  
  type Mutation {
    createUser(
      username: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
    addApartment(
      name: String!
      address: String!
      city: String!
      country: String!
      rooms: Int!
    ): Apartment
    markAsFavorite(
      name: String!
    ): Apartment
  }
`

const resolvers = {
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
    allFavorites: (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Authentication required');
      }
      return currentUser.favorites
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      );
      const currentUser = await User
        .findById(decodedToken.id);
      return { currentUser };
    }
  }
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
