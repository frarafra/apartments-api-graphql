const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

describe('when there is initially some apartments saved', () => {
  test('apartments are returned as json', async () => {
    let postData = {
      query: `query allApartments(city: String, country: String, rooms: Int){
                    allApartments{
                        name
                    }
                }`,
      operationName: 'allApartments'
    };
    request('http://localhost:4000')
      .post('/')
      .send(postData)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});

describe('addition of a new apartment', () => {
  test('succeeds with valid data', async () => {
    const user = new User({ username: 'bdemon' });
    const savedUser = await user.save();
    const userForToken = {
      username: savedUser.username,
      id: savedUser._id,
    };
    const token = jwt.sign(userForToken, process.env.SECRET);
    let postData = {
      query: `mutations addApartment(name: String!, address: String!, city: String!, country: String!, rooms: Int!){
                    addApartment(name: "Begur Platja", address: "Passeig Marítim, 3", city: "Begur", country: "Spain", rooms: 4){
                        id
                    }
                }`,
      operationName: 'allApartments'
    };
    request('http://localhost:4000')
      .post('/')
      .set('Authorization', `bearer ${token}`)
      .send(postData)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  });
  test('fails without token', async () => {
    let postData = {
      query: `mutations addApartment(name: String!, address: String!, city: String!, country: String!, rooms: Int!){
                    addApartment(name: "Begur Platja", address: "Passeig Marítim, 3", city: "Begur", country: "Spain", rooms: 4){
                        id
                    }
                }`,
      operationName: 'allApartments'
    };
    request('http://localhost:4000')
      .post('/')
      .send(postData)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
});

afterAll(() => {
  mongoose.connection.close()
});
