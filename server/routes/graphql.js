const express = require('express');
const gqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const { mergeTypes } = require('merge-graphql-schemas');
const { cardSchema, cardRoot: card } = require('./graphql/card');
const { heroSchema, heroRoot: hero } = require('./graphql/hero');

const router = express.Router();

const combinedSchemas = mergeTypes([cardSchema, heroSchema], { all: true });

const schema = buildSchema(combinedSchemas);

const gql = gqlHTTP(() => ({
  schema,
  rootValue: { card, hero },
  graphiql: true,
}));

router.post('/', gql);
router.get('/', gql);

module.exports = router;
