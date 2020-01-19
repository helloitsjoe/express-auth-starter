import test from 'ava';
import axios from 'axios';
import makeServer from '../makeServer';

// TODO: There must be a way to close ports in tests, but I haven't figured
// out a way to use the same port in multiple files without getting EADDRINUSE
const PORT = 1235;
const rootUrl = `http://localhost:${PORT}`;
const graphqlUrl = `${rootUrl}/graphql`;

let server;
test.before(async () => {
  server = await makeServer(PORT);
});

test.after(() => {
  server.close();
});

// Examples of graphql API tests
test('hero API test', async t => {
  const query = `
    query {
      hero {
        heroes {
          name
          powers
          movies
        }
      }
    }
  `;
  const { data } = await axios
    .post(graphqlUrl, { query })
    .catch(e => console.error('ERROR', e.response.data.errors[0].message));
  const { heroes } = data.data.hero;
  const allHeroesHaveNames = heroes.every(h => typeof h.name === 'string');
  const allHeroesHavePowers = heroes.every(h => h.powers.length > 0);
  const allHeroesHaveMovies = heroes.every(h => h.movies.length > 0);
  t.is(true, allHeroesHaveNames);
  t.is(true, allHeroesHavePowers);
  t.is(true, allHeroesHaveMovies);
});

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
  const { data } = await axios
    .post(graphqlUrl, { query })
    .catch(e => console.error('ERROR', e.response.data.errors[0].message));
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
