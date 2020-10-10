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

const jwtRegEx = new RegExp(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);

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

describe('jwt', () => {
  describe('/signup', () => {
    it('returns token', async () => {
      const res = await axios.post(`${rootUrl}/jwt/signup`, {
        username: 'foo',
        password: 'bar',
      });
      expect(res.data.token).toMatch(jwtRegEx);
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
      const body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/jwt/signup`, body);
      const res = await axios.post(`${rootUrl}/jwt/login`, body);
      expect(res.data.token).toMatch(jwtRegEx);
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

    it('returns error if password does not match', async () => {
      expect.assertions(1);
      const body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/jwt/signup`, body);
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
    let body;
    let token;

    beforeEach(async () => {
      // jest.useFakeTimers();
      body = { username: 'foo', password: 'bar' };
      await axios.post(`${rootUrl}/jwt/signup`, body);
      const res = await axios.post(`${rootUrl}/jwt/login`, body);
      token = res.data.token;
      expect(res.data.token).toMatch(jwtRegEx);
    });

    afterEach(() => {
      // jest.useRealTimers();
    });

    it('returns response if valid token', async () => {
      // expect.assertions(2);
      const options = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`${rootUrl}/jwt/secure`, body, options);
      expect(res.data.message).toMatch('Hi from JWT, foo!');
    });

    it('returns error if no token', async () => {
      expect.assertions(2);
      return axios.post(`${rootUrl}/jwt/secure`, body).catch(err => {
        expect(err.response.data.message).toMatch(/Authorization header is required/i);
      });
    });

    it('returns error if header is malformed', async () => {
      expect.assertions(2);
      // Missing 'Bearer ';
      const options = { headers: { Authorization: token } };
      return axios.post(`${rootUrl}/jwt/secure`, body, options).catch(err => {
        expect(err.response.data.message).toMatch(/Unauthorized! jwt must be provided/i);
      });
    });

    it('returns error if invalid token', async () => {
      expect.assertions(2);
      const options = { headers: { Authorization: 'Bearer nope.nope.nope' } };
      return axios.post(`${rootUrl}/jwt/secure`, body, options).catch(err => {
        expect(err.response.data.message).toMatch(/Unauthorized! invalid token/i);
      });
    });

    // it('returns error if expired token', done => {
    //   expect.assertions(2);
    //   const options = { headers: { Authorization: `Bearer ${token}` } };
    //   // setTimeout(() => {
    //   return axios
    //     .post(`${rootUrl}/jwt/secure`, body, options)
    //     .then(() => {
    //       // Should not get here!
    //       const error = new Error();
    //       error.response = { data: { message: 'Should fail!' } };
    //       throw error;
    //     })
    //     .catch(err => {
    //       expect(err.response.data.message).toMatch(/Unauthorized!/i);
    //       done();
    //     });
    //   // }, 200);
    // });
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
  });

  describe('/login', () => {
    it('returns token for valid login', async () => {
      const body = { username: 'foo', password: 'bar' };
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
  });

  describe('/secure', () => {
    let body;
    let token;

    beforeEach(async () => {
      jest.useFakeTimers('modern');
      body = { username: 'foo', password: 'bar' };
      // await axios.post(`${rootUrl}/session/signup`, body);
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
