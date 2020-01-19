const getRandom = (max = 1) => Math.floor(Math.random() * max);

const makeCard = (value = getRandom(13) + 1, suit = getRandom(4)) => ({ value, suit });

const makeDeck = () => new Array(52).fill().map(makeCard);

let shuffledCards = makeDeck();

const cardRoot = () => ({
  get: () => {
    if (!shuffledCards.length) {
      shuffledCards = makeDeck();
    }
    return shuffledCards.pop();
  },
  exchange: ({ card }) => {
    if (shuffledCards.length === 1) {
      shuffledCards = makeDeck();
    }
    shuffledCards.unshift(card);
    return shuffledCards.pop();
  },
});

const cardSchema = `
  type Card {
    value: Int!
    suit: Int!
  }

  input CardInput {
    value: Int!
    suit: Int!
  }

  type CardQuery {
    get: Card!
    exchange(card: CardInput!): Card!
  }

  type Query {
    card: CardQuery!
  }

  type Mutation {
    card: CardQuery!
  }
`;

module.exports = {
  cardRoot,
  cardSchema,
};
