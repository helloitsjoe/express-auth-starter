import nock from 'nock';
import { signUp, login, sendSecure } from '../services';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization',
};

const BASE_URL = 'http://localhost';
const PORT = 3001;
const URL = `${BASE_URL}:${PORT}`;
const username = 'foo';
const password = 'secret';

describe('Services', () => {
  it('login sends username and password to endpoint', async () => {
    nock(URL).post('/jwt/login', { username, password }).reply(200, null, headers);
    const res = await login({ endpoint: '/jwt', username, password });
    expect(res.status).toBe(200);
  });

  it('signUp hits signup endpoint with username/password', async () => {
    nock(URL).post('/simple-token/signup', { username, password }).reply(200, null, headers);
    const res = await signUp({ endpoint: '/simple-token', username, password });
    expect(res.status).toBe(200);
  });

  it('sendSecure sends auth to secure endpoint', async () => {
    nock(URL).options('/session/secure').reply(200, null, headers);
    nock(URL, { reqheaders: { authorization: 'Bearer aaa' } })
      .post('/session/secure', { message: 'hi' })
      .reply(200, null, headers);
    const res = await sendSecure({ endpoint: '/session', message: 'hi', token: 'aaa' });
    expect(res.status).toBe(200);
  });
});
