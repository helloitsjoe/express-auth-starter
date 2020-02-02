const test = require('ava');
const axios = require('axios');
const { graphqlSync, buildSchema } = require('graphql');
const { heroSchema } = require('./heroes');
const makeServer = require('../makeServer');

// Todo: use makeExectuableSchema
const schema = buildSchema(heroSchema);

// Todo: write these after converting heroRootObject to heroRootClass
// test('gets random hero', t => {
//   const { name, powers } = heroRootObject.randomHero();
//   const powersAreStrings = powers.every(p => typeof p === 'string');
//   t.is(typeof name, 'string');
//   t.is(powersAreStrings, true);
// });

// test('gets heroes by power', t => {
//   const strongHeroes = heroRootObject.heroes({ power: 'strength' });
//   const names = strongHeroes.map(({ name }) => name);
//   t.deepEqual(names, ['Mr. Incredible', 'Mrs. Incredible', 'Jack-Jack']);
// });

// test('gets hero by name', t => {
//   const [indy] = heroRootObject.heroes({ name: 'indiana jones' });
//   t.is(indy.name, 'Indiana Jones');
// });

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

test('get hero by name', async t => {
  const query = `
    query {
      heroes(name: "indiana jones") {
        name
      }
    }
  `;
  const res = await axios
    .post(graphqlUrl, { query })
    .catch(e => console.error('ERROR', e.message || e.response.data.errors[0].message));
  const [indy] = res.data.data.heroes;
  t.is(indy.name, 'Indiana Jones');
});

test('uppercase name', async t => {
  const query = `
    query {
      heroes(name: "indiana jones") {
        name(shouldUppercase: true)
      }
    }
  `;
  const res = await axios
    .post(graphqlUrl, { query })
    .catch(e => console.error('ERROR', e.message || e.response.data.errors[0].message));
  const [indy] = res.data.data.heroes;
  t.is(indy.name, 'INDIANA JONES');
});

test('get random hero', async t => {
  const query = `
    query {
      randomHero {
        name
      }
    }
  `;
  const res = await axios
    .post(graphqlUrl, { query })
    .catch(e => console.error('ERROR', e.message || e.response.data.errors[0].message));
  t.is(typeof res.data.data.randomHero.name, 'string');
});

// TODO: Fix this after converting buildSchema to makeExecutableSchema
// test('without endpoint', t => {
//   const source = `
//     query {
//       heroes(name: "indiana jones") {
//         name
//       }
//     }
//   `;
//   const res = graphqlSync({ schema, source });
//   // .catch(e => console.error('ERROR', e.message || e.response.data.errors[0].message));
//   console.log(res);
//   const [indy] = res.data.data.heroes;
//   t.is(indy.name, 'Indiana Jones');
// });
