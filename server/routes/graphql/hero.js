const heroes = [
  { name: 'Mr. Incredible', powers: ['strength'] },
  { name: 'Mrs. Incredible', powers: ['stretch'] },
  { name: 'Dash', powers: ['speed'] },
  { name: 'Violet', powers: ['invisibility'] },
  { name: 'Jack-Jack', powers: ['fire', 'transformation', 'teleportation'] },
  { name: 'Frozone', powers: ['freeze'] },
];

const heroSchema = `
  type Hero {
    name: String!
    powers: [String!]!
  }

  type HeroNamespace {
    getAll: [Hero!]!
    getRandom: Hero!
  }

  type Query {
    hero: HeroNamespace!
  }
`;

const heroRoot = {
  getRandom: () => Math.floor(Math.random() * heroes.length),
  getByPower: ({ power }) => heroes.filter(hero => hero.powers.includes(power)),
};

module.exports = {
  heroRoot,
  heroSchema,
};
