const mongoose = require('mongoose');
const request = require('supertest');

describe('when creating a new user', () => {
  test('succeedes with valid data', async () => {
    let postData = {
      mutation: `mutation createUser(username: String!){
                    createUser(username: "Robert"){
                        id
                    }
                }`,
      operationName: 'createUser'
    };
    request('http://localhost:4000')
      .post('/')
      .send(postData)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  });
  test('should provide username otherwise the response is 400 bad request', async () => {
    let postData = {
      mutation: `mutation createUser(username: String!){
                    createUser{
                        id
                    }
                }`,
      operationName: 'createUser'
    };
    request('http://localhost:4000')
      .post('/')
      .send(postData)
      .expect(400, {
        error: 'content missing' });
  });
  test('should provide password with at least 4 characters long', async () => {
    let postData = {
      mutation: `mutation createUser(username: String!){
                    createUser(username: "Bob"){
                        id
                    }
                }`,
      operationName: 'createUser'
    };
    request('http://localhost:4000')
      .post('/')
      .send(postData)
      .expect(400, {
        error: 'password must be at least 4 characters long' });
  });
});

afterAll(() => {
  mongoose.connection.close();
});