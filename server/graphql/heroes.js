const { heroes } = require('./data');

const heroSchema = `
  type Hero {
    name(shouldUppercase: Boolean): String!
    powers: [String!]!
    movies: [String!]!
  }

  type HeroQuery {
    fake: String!
    heroes: [Hero!]!
    hero(name: String): Hero!
    randomHero: Hero!
    getByPower: [Hero!]!
  }
  type Query {
    hero: HeroQuery!
  }
`;

const hero = args => {
  console.log(args);
  return {
    name({ shouldUppercase = false }) {
      return shouldUppercase ? this.name.toUpperCase() : this.name;
    }
  };
};

const heroRoot = {
  hero,
  fake: 'HI',
  heroes(root, args, context, info) {
    console.log('FAKE', this.fake);
    console.log(`root:`, root);
    console.log(`args:`, typeof args);
    console.log(`context:`, context);
    console.log(`info:`, info);
    return heroes;
  },
  randomHero: () => heroes[Math.floor(Math.random() * heroes.length)],
  getByPower: ({ power }) => heroes.filter(hero => hero.powers.includes(power))
};

module.exports = {
  heroRoot,
  heroSchema
};
