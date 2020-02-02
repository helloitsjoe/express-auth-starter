const test = require('ava');
const axios = require('axios');
const makeServer = require('../makeServer');

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
      heroes {
        name
        powers
        movies
      }
    }
  `;
  const res = await axios
    .post(graphqlUrl, { query })
    .catch(e => console.error('ERROR', e.message || e.response.data.errors[0].message));
  const { heroes } = res.data.data;
  const allHeroesHaveNames = heroes.every(h => typeof h.name === 'string');
  const allHeroesHavePowers = heroes.every(h => h.powers.length > 0);
  const allHeroesHaveMovies = heroes.every(h => h.movies.length > 0);
  t.is(true, allHeroesHaveNames);
  t.is(true, allHeroesHavePowers);
  t.is(true, allHeroesHaveMovies);
});

test('movies API test', async t => {
  const query = `
    query {
      movies {
        name
        heroes {
          name
        }
        villains {
          name
        }
      }
    }
  `;
  const res = await axios
    .post(graphqlUrl, { query })
    .catch(e => console.error('ERROR', e.message || e.response.data.errors[0].message));
  const { movies } = res.data.data;
  const allMoviesHaveNames = movies.every(m => typeof m.name === 'string');
  const allMoviesHaveHeroes = movies.every(m => m.heroes.length > 0);
  const allMoviesHaveVillains = movies.every(m => m.villains.length > 0);
  t.is(true, allMoviesHaveNames);
  t.is(true, allMoviesHaveHeroes);
  t.is(true, allMoviesHaveVillains);
});
