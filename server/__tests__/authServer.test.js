const test = require('ava');
const axios = require('axios');
const makeAuthServer = require('../makeAuthServer');

const PORT = 1235;
const rootUrl = `http://localhost:${PORT}`;

let server;
test.before(async () => {
  server = await makeAuthServer(PORT);
});

test.after(done => {
  server.close(done);
});

test('listens on given port', t => {
  const actualPort = server.address().port;
  t.is(actualPort, PORT);
});

test('returns server if already listening', async t => {
  const listeningServer = await makeServer(PORT);
  t.is(listeningServer, server);
});

test('index route returns oauth', async t => {
  const res = await axios.get(rootUrl);
  const dataIsHTML = /<!DOCTYPE html>/.test(res.data);
  // TODO: what should this actually test?
  t.is(dataIsHTML, true);
});
