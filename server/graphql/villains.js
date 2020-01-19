const { villains } = require('./data');

const villainSchema = `
  type Villain {
    name: String!
    powers: [String!]!
  }

  type VillainQuery {
    villains: [Villain!]!
    randomVillain: Villain!
    getByPower: [Villain!]!
  }

  type Query {
    villain: VillainQuery!
  }
`;

const villainRoot = {
  villains,
  randomVillain: () => villains[Math.floor(Math.random() * villains.length)],
  getByPower: ({ power }) => villains.filter(villain => villain.powers.includes(power)),
};

module.exports = {
  villainRoot,
  villainSchema,
};
