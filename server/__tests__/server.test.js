/**
 * @jest-environment node
 */
const axios = require('axios');
const makeServer = require('../makeServer');

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

test('index route returns index.html', async () => {
  const res = await axios.get(rootUrl).catch(err => console.error(err));
  const dataIsHTML = /<!DOCTYPE html>/.test(res.data);
  expect(dataIsHTML).toBe(true);
});
