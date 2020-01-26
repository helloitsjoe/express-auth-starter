const test = require('ava');
const axios = require('axios');
const { heroRoot } = require('./heroes');
const makeServer = require('../makeServer');

// Examples of resolver unit tests
test('gets random hero', t => {
  const { name, powers } = heroRoot.randomHero();
  const powersAreStrings = powers.every(p => typeof p === 'string');
  t.is(typeof name, 'string');
  t.is(powersAreStrings, true);
});

test('gets heroes by power', t => {
  const strongHeroes = heroRoot.getByPower({ power: 'strength' });
  const names = strongHeroes.map(({ name }) => name);
  t.deepEqual(names, ['Mr. Incredible', 'Mrs. Incredible', 'Jack-Jack']);
});

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
  const res = await axios
    .post(graphqlUrl, { query })
    .catch(e => console.error('ERROR', e.message || e.response.data.errors[0].message));
  const { heroes } = res.data.data.hero;
  const allHeroesHaveNames = heroes.every(h => typeof h.name === 'string');
  const allHeroesHavePowers = heroes.every(h => h.powers.length > 0);
  const allHeroesHaveMovies = heroes.every(h => h.movies.length > 0);
  t.is(true, allHeroesHaveNames);
  t.is(true, allHeroesHavePowers);
  t.is(true, allHeroesHaveMovies);
});
