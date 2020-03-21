const test = require('ava');
const axios = require('axios');
const makeServer = require('./makeServer');

const PORT = 1234;
const rootUrl = `http://localhost:${PORT}`;

let server;
test.before(async () => {
  server = await makeServer(PORT);
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

test('index route returns index.html', async t => {
  const res = await axios.get(rootUrl);
  const dataIsHTML = /<!DOCTYPE html>/.test(res.data);
  t.is(dataIsHTML, true);
});
