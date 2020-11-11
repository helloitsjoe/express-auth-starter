const express = require('express');
const gqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const basicSchema = buildSchema(`
  type Query {
    foo: String!
  }
`);

const rootValue = {
  foo: 'bar',
};

const gql = gqlHTTP(() => ({
  schema: basicSchema,
  rootValue,
  graphiql: true,
}));

const router = express.Router();

router.post('/', gql);
router.get('/', gql);

export default router;
