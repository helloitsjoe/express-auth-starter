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

test('oauth route returns oauth dialog', async () => {
  const res = await axios.get(`${rootUrl}/oauth`);
  const dataIsHTML = /<!DOCTYPE html>/.test(res.data);
  expect(dataIsHTML).toBe(true);
  expect(res.data).toMatch(/<button(.*)>Authorize<\/button>/i);
});
