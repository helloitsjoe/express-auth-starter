import test from 'ava';
import axios from 'axios';
import makeServer from './makeServer';

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

// Examples of graphql API tests
test('graphql route "get" query returns card', async t => {
  const query = `
    query {
      card {
        get {
          value
          suit
        }
      }
    }
  `;
  const { data } = await axios.post(graphqlUrl, { query }).catch(e => console.log(e.message));
  const { value, suit } = data.data.card.get;
  t.is(typeof value, 'number');
  t.is(typeof suit, 'number');
});

test('graphql route "exchange" mutation exchanges card', async t => {
  const query = `
    mutation($card: CardInput!) {
      card {
        exchange(card: $card) {
          value
          suit
        }
      }
    }
  `;
  const card = { value: 1, suit: 0 };
  const { data } = await axios
    .post(graphqlUrl, {
      query,
      variables: { card },
    })
    .catch(e => console.error('ERROR', e.response.data.errors[0].message));
  const { exchange } = data.data.card;
  const { value, suit } = exchange;
  t.is(typeof value, 'number');
  t.is(typeof suit, 'number');
  t.notDeepEqual(card, exchange);
});
