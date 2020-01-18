const express = require('express');
const gqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const router = express.Router();

const getRandom = (max = 1) => Math.floor(Math.random()) * max;

const makeCard = (value = getRandom(13) + 1, suit = getRandom(4)) => ({ value, suit });

const makeDeck = () => new Array(52).fill(makeCard());

let shuffledCards = makeDeck();

const rootValue = {
  get: args => {
    if (!shuffledCards.length) {
      shuffledCards = makeDeck();
    }
    return shuffledCards.pop();
  },
  exchange: args => {
    shuffledCards.unshift(args.card);
    return shuffledCards.pop();
  },
};

const schema = buildSchema(`
  type Card {
    value: Int!
    suit: Int!
  }

  input CardInput {
    value: Int!
    suit: Int!
  }

  type Query {
    get: Card!
  }

  type Mutation {
    exchange(card: CardInput!): Card!
  }
`);

const gql = gqlHTTP(req => ({
  schema,
  rootValue,
  graphiql: true,
}));

router.post('/', gql);
router.get('/', gql);

module.exports = router;
