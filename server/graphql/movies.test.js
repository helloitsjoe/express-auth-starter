const test = require('ava');
const { graphql, buildSchema } = require('graphql');
const { mergeTypes } = require('merge-graphql-schemas');
const { heroSchema } = require('../graphql/heroes');
const { movieSchema, movieRoot: rootValue } = require('../graphql/movies');
const { villainSchema } = require('../graphql/villains');

// Need to merge schemas in this test because movie types refer to Hero/Villain types
const combinedTypes = mergeTypes([heroSchema, villainSchema, movieSchema], {
  all: true,
});
const schema = buildSchema(combinedTypes);

test('by name', async t => {
  const source = `
    query {
      movies(name: "batman") {
        name
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue });
  t.is(res.data.movies[0].name, 'Batman');
});

test('by cast member name', async t => {
  const source = `
    query {
      movies(castMemberName: "joker") {
        name
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue });
  t.is(res.data.movies[0].name, 'Batman');
});

test('random movie', async t => {
  const source = `
    query {
      randomMovie {
        name
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue });
  t.is(typeof res.data.randomMovie.name, 'string');
});
