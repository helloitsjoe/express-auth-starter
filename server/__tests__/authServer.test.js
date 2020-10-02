/**
 * @jest-environment node
 */
const axios = require('axios');
const makeAuthServer = require('../makeAuthServer');

const PORT = 1235;
const rootUrl = `http://localhost:${PORT}`;

let server;
beforeAll(async () => {
  server = await makeAuthServer(PORT);
});

afterAll(done => {
  server.close(done);
});

test('listens on given port', () => {
  const actualPort = server.address().port;
  expect(actualPort).toBe(PORT);
});

test('returns server if already listening', async () => {
  const listeningServer = await makeAuthServer(PORT);
  expect(listeningServer).toBe(server);
});

describe('oauth', () => {
  it('oauth route returns oauth dialog', async () => {
    const res = await axios.get(`${rootUrl}/oauth`);
    const dataIsHTML = /<!DOCTYPE html>/.test(res.data);
    expect(dataIsHTML).toBe(true);
    expect(res.data).toMatch(/<button(.*)>Authorize<\/button>/i);
  });
});

describe('jwt', () => {
  describe('/signup', () => {
    it('returns token', async () => {
      const res = await axios.post(`${rootUrl}/jwt/signup`, {
        username: 'foo',
        password: 'bar',
      });
      expect(res.data.token).toMatch(/\w+.\w+.\w+/);
    });

    it('returns error if username exists', async () => {
      expect.assertions(1);
      await axios.post(`${rootUrl}/jwt/signup`, {
        username: 'first',
        password: 'bar',
      });

      return axios
        .post(`${rootUrl}/jwt/signup`, {
          username: 'first',
          password: 'bar',
        })
        .catch(err => {
          expect(err.response.data.message).toMatch(/unavailable/i);
        });
    });
  });

  describe('/login', () => {
    it('returns token', async () => {
      // TODO: Seed data and isolate tests
      const res = await axios.post(`${rootUrl}/jwt/login`, {
        username: 'foo',
        password: 'bar',
      });
      expect(res.data.token).toMatch(/\w+.\w+.\w+/);
    });

    it('returns error if user does not exist', () => {
      expect.assertions(1);
      return axios
        .post(`${rootUrl}/jwt/login`, {
          username: 'nobody',
          password: 'bar',
        })
        .catch(err => {
          expect(err.response.data.message).toMatch(/does not exist/i);
        });
    });

    it('returns error if password does not match', () => {
      expect.assertions(1);
      return axios
        .post(`${rootUrl}/jwt/login`, {
          username: 'foo',
          password: 'wrong-password',
        })
        .catch(err => {
          expect(err.response.data.message).toMatch(/wrong password/i);
        });
    });
  });

  describe('/secure', () => {
    it.todo('returns error if no token');
    it.todo('returns error if invalid token');
    it.todo('returns response if valid token');
  });
});
