const { heroes } = require('./data');

const heroSchema = `
  type Hero {
    name(shouldUppercase: Boolean): String!
    powers: [String!]!
    movies: [String!]!
  }

  type Query {
    heroes(name: String, power: String): [Hero!]!
    randomHero: Hero!
  }
`;

const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const heroesResolver = ({ name, power } = {}) => {
  const heroesByName = name ? heroes.filter(h => h.name.match(new RegExp(name, 'i'))) : heroes;
  const heroesByPower = power ? heroesByName.filter(h => h.powers.includes(power)) : heroes;
  const finalHeroes = [...new Set([...heroesByName, ...heroesByPower])];

  return finalHeroes.map(h => ({
    // Note: This works, but you can't unit test this resolver anymore
    // because hero.name returns a function instead of a value
    name({ shouldUppercase = false }) {
      return shouldUppercase ? h.name.toUpperCase() : h.name;
    },
    powers: h.powers,
    movies: h.movies,
  }));
};

const heroRootObject = {
  heroes: heroesResolver,
  randomHero: getRandom(heroesResolver()),
};

class Hero {
  // heroes() {
  //   return new Heroes({name, power});
  // }
  // randomHero() {}
}

// class Heroes {
//   constructor({name, power}) {
//     this._name = name;
//     this.power = power;
//   }

//   name() {

//   }

//   power() {
//     return
//   }
// }

module.exports = {
  heroRootObject,
  heroRootClass: new Hero(),
  heroSchema,
};
