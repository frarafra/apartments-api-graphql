const { gql } = require('apollo-server');

module.exports = gql`
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
    allFavorites: [String]
    nearestApartment(locationX: Float!, locationY: Float!, distance: Int!): [Apartment]
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