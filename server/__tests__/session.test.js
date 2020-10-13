/**
 * @jest-environment node
 */
const axios = require('axios');
const makeAuthServer = require('../makeAuthServer');
const { makeDb } = require('../middleware');
const { makeTestDb } = require('../services');
const { silenceLogsMatching } = require('../test-utils');

console.log = silenceLogsMatching('Auth Server listening')(console.log);
console.error = silenceLogsMatching('Error verifying token')(console.error);

let db;
let err;
let server;
let rootUrl;

const getRootUrl = port => `http://localhost:${port}`;
const setError = e => {
  err = e;
};

beforeEach(async () => {
  db = { users: makeTestDb(), tokens: makeTestDb() };
  // Passing port 0 to server assigns a random port
  server = await makeAuthServer(0, db);
  const { port } = server.address();
  rootUrl = getRootUrl(port);
});

afterEach(done => {
  db = null;
  err = null;
  rootUrl = null;
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

    it('returns error if no username', async () => {
      const body = { password: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body).catch(setError);
      expect(err.response.status).toBe(401);
      expect(err.response.data.message).toMatch(/username/i);
    });

    it('returns error if no password', async () => {
      const body = { username: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body).catch(setError);
      expect(err.response.status).toBe(401);
      expect(err.response.data.message).toMatch(/password/i);
    });

    it('returns error if user already exists', async () => {
      const body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body);
      await axios.post(`${rootUrl}/session/signup`, body).catch(setError);
      expect(err.response.status).toBe(401);
      expect(err.response.data.message).toMatch(/username already exists/i);
    });

    it('does not store plaintext password', async () => {
      const username = 'foo';
      const body = { username, password: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body);
      const [user] = await db.users.find({ username });
      console.log(`user:`, user);
      expect(typeof user.password).toBe('undefined');
      expect(typeof user.hash).toBe('string');
      expect(user.hash).not.toMatch(body.password);
    });
  });

  describe('/login', () => {
    it('returns token for valid login', async () => {
      const body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body);
      const res = await axios.post(`${rootUrl}/session/login`, body);
      expect(typeof res.data.token).toBe('string');
    });

    it('returns error if no username', async () => {
      expect.assertions(2);
      const body = { password: 'bar' };
      await axios.post(`${rootUrl}/session/login`, body).catch(setError);
      expect(err.response.status).toBe(401);
      expect(err.response.data.message).toMatch(/username and password are both required/i);
    });

    it('returns error if no password', async () => {
      const body = { username: 'foo' };
      await axios.post(`${rootUrl}/session/login`, body).catch(setError);
      expect(err.response.status).toBe(401);
      expect(err.response.data.message).toMatch(/username and password are both required/i);
    });

    it('returns error if password does not match', async () => {
      const body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/session/signup`, body);
      const wrong = { username: 'foo', password: 'not-bar' };
      await axios.post(`${rootUrl}/session/login`, wrong).catch(setError);
      expect(err.response.status).toBe(401);
      expect(err.response.data.message).toMatch(/username and password do not match/i);
    });

    it('returns error if username does not exist', async () => {
      const body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/session/login`, body).catch(setError);
      expect(err.response.status).toBe(401);
      expect(err.response.data.message).toMatch(/username does not exist/i);
    });
  });

  describe('/secure', () => {
    let body;
    let token;

    beforeEach(async () => {
      body = { username: 'foo', password: 'bar' };
      const res = await axios.post(`${rootUrl}/session/signup`, body);
      // const res = await axios.post(`${rootUrl}/session/login`, body);
      token = res.data.token;
      expect(res.data.token).toMatch(/\w+/);
    });

    it('returns response if valid token', async () => {
      const options = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`${rootUrl}/session/secure`, body, options);
      expect(res.data.message).toMatch('Hello from session auth, foo!');
    });

    it('returns error if no token', async () => {
      await axios.post(`${rootUrl}/session/secure`, body).catch(setError);
      expect(err.response.data.message).toMatch(/Unauthorized!/i);
    });

    it('returns error if invalid token', async () => {
      const options = { headers: { Authorization: `Bearer not-token` } };
      await axios.post(`${rootUrl}/session/secure`, body, options).catch(setError);
      expect(err.response.data.message).toMatch(/Unauthorized!/i);
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

  describe('/revoke', () => {
    let body;
    let token;
    let options;

    beforeEach(async () => {
      body = { username: 'foo', password: 'bar' };
      const res = await axios.post(`${rootUrl}/session/signup`, body);
      // const res = await axios.post(`${rootUrl}/session/login`, body);
      token = res.data.token;
      expect(res.data.token).toMatch(/\w+/);

      options = { headers: { Authorization: `Bearer ${token}` } };
      const secureRes = await axios.post(`${rootUrl}/session/secure`, body, options);
      expect(secureRes.data.message).toMatch(/hello/i);
    });

    afterEach(() => {
      body = null;
      token = null;
    });

    it('revokes token with valid username', async () => {
      const revokedRes = await axios.post(`${rootUrl}/session/revoke`, { token });
      expect(revokedRes.data.token).toBe(token);

      await axios.post(`${rootUrl}/session/secure`, body, options).catch(setError);
      expect(err.response.status).toBe(403);
      expect(err.response.data.message).toMatch(/unauthorized/i);
    });

    it('responds with 404 if no token exists for username', async () => {
      await axios.post(`${rootUrl}/session/revoke`, { token: 'foo' }).catch(setError);
      expect(err.response.status).toBe(404);
      expect(err.response.data.message).toMatch(/token not found/i);
    });

    it.todo('TODO: Experiment with postgres/sqlite');
  });
});
