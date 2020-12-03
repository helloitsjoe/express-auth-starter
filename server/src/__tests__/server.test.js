/**
 * @jest-environment node
 */
import axios from 'axios';
import makeServer from '../makeServer.ts';
import makeAuthServer from '../makeAuthServer.ts';

require('dotenv').config();

const PORT = 1234;
const rootUrl = `http://localhost:${PORT}`;

let server;

beforeAll(async () => {
  server = await makeServer(PORT);
});

afterAll(done => {
  server.close(done);
});

test('listens on given port', () => {
  const actualPort = server.address().port;
  expect(actualPort).toBe(PORT);
});

test('returns server if already listening', async () => {
  const listeningServer = await makeServer(PORT);
  expect(listeningServer).toBe(server);
});

// Moving index.html to makeAuthServer, but leaving this here
// for after potential cross-domain cookies fix
test.skip('index route returns index.html', async () => {
  const res = await axios.get(rootUrl).catch(err => console.error(err));
  const dataIsHTML = /<!DOCTYPE html>/.test(res.data);
  expect(dataIsHTML).toBe(true);
});

test('authServer index route returns index.html', async () => {
  const authServer = await makeAuthServer(0);
  const { port } = authServer.address();
  const res = await axios.get(`http://localhost:${port}`).catch(err => console.error(err));
  const dataIsHTML = /<!DOCTYPE html>/.test(res.data);
  expect(dataIsHTML).toBe(true);
  authServer.close();
});
