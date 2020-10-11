/**
 * @jest-environment node
 */
const axios = require('axios');
const makeAuthServer = require('../makeAuthServer');
const { makeDb } = require('../dbMiddleware');
const { silenceLogsMatching } = require('../test-utils');

console.log = silenceLogsMatching('Auth Server listening')(console.log);
console.error = silenceLogsMatching('Error verifying token')(console.error);

const getRootUrl = port => `http://localhost:${port}`;

let server;
let rootUrl;

beforeEach(async () => {
  const db = makeDb();
  // Passing port 0 to server assigns a random port
  server = await makeAuthServer(0, db);
  const { port } = server.address();
  rootUrl = getRootUrl(port);
});

afterEach(done => {
  server.close(done);
});

test('listens on given port', () => {
  const actualPort = server.address().port;
  expect(typeof actualPort).toBe('number');
});

describe('oauth', () => {
  it('oauth route returns oauth dialog', async () => {
    const res = await axios.get(`${rootUrl}/oauth`);
    const dataIsHTML = /<!DOCTYPE html>/.test(res.data);
    expect(dataIsHTML).toBe(true);
    expect(res.data).toMatch(/<button(.*)>Authorize<\/button>/i);
  });
});

describe('session', () => {
  describe('/signup', () => {
    it('returns token for valid signup', async () => {
      const body = { username: 'foo', password: 'bar' };
      const res = await axios.post(`${rootUrl}/session/signup`, body);
      expect(typeof res.data.token).toBe('string');
    });

    it('returns error if no username', () => {
      expect.assertions(2);
      const body = { password: 'bar' };
      return axios.post(`${rootUrl}/session/signup`, body).catch(err => {
        expect(err.response.status).toBe(401);
        expect(err.response.data.message).toMatch(/username/i);
      });
    });

    it('returns error if no password', () => {
      expect.assertions(2);
      const body = { username: 'bar' };
      return axios.post(`${rootUrl}/session/signup`, body).catch(err => {
        expect(err.response.status).toBe(401);
        expect(err.response.data.message).toMatch(/password/i);
      });
    });

    it('returns error if user already exists', async () => {
      expect.assertions(2);
      const body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body);
      try {
        await axios.post(`${rootUrl}/session/signup`, body);
      } catch (err) {
        expect(err.response.status).toBe(401);
        expect(err.response.data.message).toMatch(/username already exists/i);
      }
    });
  });

  describe('/login', () => {
    it('returns token for valid login', async () => {
      const body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body);
      const res = await axios.post(`${rootUrl}/session/login`, body);
      expect(typeof res.data.token).toBe('string');
    });

    it('returns error if no username', () => {
      expect.assertions(2);
      const body = { password: 'bar' };
      return axios.post(`${rootUrl}/session/login`, body).catch(err => {
        expect(err.response.status).toBe(401);
        expect(err.response.data.message).toMatch(/username and password are both required/i);
      });
    });

    it('returns error if no password', () => {
      expect.assertions(2);
      const body = { username: 'foo' };
      return axios.post(`${rootUrl}/session/login`, body).catch(err => {
        expect(err.response.status).toBe(401);
        expect(err.response.data.message).toMatch(/username and password are both required/i);
      });
    });

    it('returns error if password does not match', async () => {
      expect.assertions(2);
      const body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body);
      try {
        const wrongPassword = { username: 'foo', password: 'not-bar' };
        await axios.post(`${rootUrl}/session/login`, wrongPassword);
      } catch (err) {
        expect(err.response.status).toBe(401);
        expect(err.response.data.message).toMatch(/username and password do not match/i);
      }
    });

    it('returns error if username does not exist', () => {
      //
    });
  });

  describe('/secure', () => {
    let body;
    let token;

    beforeEach(async () => {
      // jest.useFakeTimers('modern');
      body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body);
      const res = await axios.post(`${rootUrl}/session/login`, body);
      token = res.data.token;
      expect(res.data.token).toMatch(/\w+/);
    });

    it('returns response if valid token', async () => {
      const options = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`${rootUrl}/session/secure`, body, options);
      expect(res.data.message).toMatch('Hi from session auth, foo!');
    });

    it('returns error if no token', async () => {
      expect.assertions(2);
      return axios.post(`${rootUrl}/session/secure`, body).catch(err => {
        expect(err.response.data.message).toMatch(/Unauthorized!/i);
      });
    });

    it('returns error if invalid token', async () => {
      expect.assertions(2);
      const options = { headers: { Authorization: `Bearer not-token` } };
      return axios.post(`${rootUrl}/session/secure`, body, options).catch(err => {
        expect(err.response.data.message).toMatch(/Unauthorized!/i);
      });
    });

    // it('returns error if expired token', () => {
    //   console.log(`date.now:`, Date.now());
    //   jest.advanceTimersByTime(60 * 60 * 1000 + 1000);
    //   console.log(`date.now:`, Date.now());
    //   expect.assertions(2);
    //   const options = { headers: { Authorization: `Bearer ${token}` } };
    //   return axios.post(`${rootUrl}/session/secure`, body, options).catch(err => {
    //     expect(err.response.data.message).toMatch(/Unauthorized!/i);
    //   });
    // });
  });
});
