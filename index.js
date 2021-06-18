const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MONGODB_URI, JWT_SECRET } = require('./config')
const User = require('./models/user');
const typeDefs = require('./types/types')
const resolvers = require('./resolvers/resolvers')

console.log('Connecting to ', MONGODB_URI,'...');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('Connected to Mongo DB');
  })
  .catch((err) => {
    console.error('Error while connecting to Mongo DB: ', err.message);
  });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  }
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
