const test = require('ava');
const axios = require('axios');
const { graphql, buildSchema } = require('graphql');
const { heroSchema, heroRootObject } = require('./heroes');
const makeServer = require('../makeServer');

const schema = buildSchema(heroSchema);

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

// Raw graphql tests, no server VVVVVV

test('get hero by name', async t => {
  const source = `
    query {
      heroes(name: "indiana jones") {
        name
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue: heroRootObject });
  const [indy] = res.data.heroes;
  t.is(indy.name, 'Indiana Jones');
});

test('uppercase name', async t => {
  const source = `
    query {
      heroes(name: "indiana jones") {
        name(shouldUppercase: true)
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue: heroRootObject });
  const [indy] = res.data.heroes;
  t.is(indy.name, 'INDIANA JONES');
});

test('get hero by power', async t => {
  const source = `
    query {
      heroes(power: "strength") {
        name
        powers
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue: heroRootObject });
  t.is(res.data.heroes.every(h => h.powers.includes('strength')), true);
});

test('get random hero', async t => {
  const source = `
    query {
      randomHero {
        name
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue: heroRootObject });
  t.is(typeof res.data.randomHero.name, 'string');
});
