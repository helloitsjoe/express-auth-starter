import test from 'ava';
import makeServer from './makeServer';
import axios from 'axios';

const PORT = 1234;
const rootUrl = `http://localhost:${PORT}`;
const graphqlUrl = `${rootUrl}/graphql`;

let server;
test.before(async () => {
  server = await makeServer(PORT);
});

test.after(() => {
  server.close();
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

test('graphql route "get" query returns card', async t => {
  const res = await axios
    .post(graphqlUrl, { query: 'query { get { value suit } }' })
    .catch(e => console.log(e.message));
  const { data } = res;
  t.deepEqual(data.data.get, { value: 1, suit: 0 });
});

test.skip('graphql route "exchange" mutation exchanges card', async t => {
  const res = await axios
    .post(graphqlUrl, {
      query: 'mutation { exchange(card: { value: 1, suit: 0 }) { value suit } }',
    })
    .catch(e => console.log(e.message));
  const { data } = res;
  t.deepEqual(data.data.exchange, { value: 2, suit: 0 });
});
