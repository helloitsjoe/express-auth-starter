const { heroes } = require('./data');

const heroSchema = `
  type Hero {
    name: String!
    powers: [String!]!
    movies: [String!]!
  }

  type HeroQuery {
    heroes: [Hero!]!
    randomHero: Hero!
    getByPower: [Hero!]!
  }

  type Query {
    hero: HeroQuery!
  }
`;

const heroRoot = {
  heroes,
  randomHero: () => heroes[Math.floor(Math.random() * heroes.length)],
  getByPower: ({ power }) => heroes.filter(hero => hero.powers.includes(power)),
};

module.exports = {
  heroRoot,
  heroSchema,
};
