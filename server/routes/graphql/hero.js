const heroes = [
  { name: 'Mr. Incredible', powers: ['strength', 'invulnerability'] },
  { name: 'Mrs. Incredible', powers: ['stretch', 'strength'] },
  { name: 'Dash', powers: ['speed'] },
  { name: 'Violet', powers: ['invisibility'] },
  { name: 'Jack-Jack', powers: ['fire', 'transformation', 'teleportation', 'strength', 'stretch'] },
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
  getRandom: () => heroes[Math.floor(Math.random() * heroes.length)],
  getByPower: ({ power }) => heroes.filter(hero => hero.powers.includes(power)),
};

module.exports = {
  heroRoot,
  heroSchema,
};
