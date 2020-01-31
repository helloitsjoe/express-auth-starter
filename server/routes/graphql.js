const express = require('express');
const gqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const { mergeTypes } = require('merge-graphql-schemas');
const { heroSchema, heroRoot: hero } = require('../graphql/heroes');
const { movieSchema, movieRoot: movie } = require('../graphql/movies');
const { villainSchema, villainRoot: villain } = require('../graphql/villains');

// TODO: This schema design could probably be improved
const combinedSchemas = mergeTypes([heroSchema, villainSchema, movieSchema], {
  all: true
});

const gql = gqlHTTP(() => ({
  schema: buildSchema(combinedSchemas),
  rootValue: { hero, villain, movie },
  graphiql: true
}));

const router = express.Router();

router.post('/', gql);
router.get('/', gql);

module.exports = router;
