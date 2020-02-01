const { heroes } = require('./data');

const heroSchema = `
  type Hero {
    name(shouldUppercase: Boolean): String!
    powers: [String!]!
    movies: [String!]!
  }

  type Query {
    hero(name: String, power: String): Hero!
    heroes: [Hero!]!
    randomHero: Hero!
    getByPower: [Hero!]!
  }
`;

const getRandomHero = () => heroes[Math.floor(Math.random() * heroes.length)];

const getHeroFromArgs = ({ name, power }) => {
  const defaultHero = { name: 'Unknown', powers: ['Unknown'], movies: ['Unknown'] };
  if (name) {
    return heroes.find(h => h.name.match(new RegExp(name, 'i'))) || defaultHero;
  }
  if (power) {
    return heroes.find(h => h.powers.includes(power)) || defaultHero;
  }
  return getRandomHero();
};

const hero = ({ name, power } = {}) => {
  const hero = getHeroFromArgs({ name, power });
  return {
    name({ shouldUppercase = false }) {
      return shouldUppercase ? hero.name.toUpperCase() : hero.name;
    },
    powers: hero.powers,
    movies: hero.movies,
  };
};

const heroRootObject = {
  hero,
  heroes,
  randomHero: () => hero(),
};

class Hero {
  hero() {}

  heroes() {}

  randomHero() {}
}

module.exports = {
  heroRootObject,
  heroRootClass: new Hero(),
  heroSchema,
};
