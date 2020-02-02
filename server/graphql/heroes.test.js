const test = require('ava');
const { graphql, buildSchema } = require('graphql');
const { heroSchema, heroRootObject } = require('./heroes');

const schema = buildSchema(heroSchema);

test('get hero by name', async t => {
  const source = `
    query {
      heroes(name: "indiana jones") {
        name
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue: heroRootObject });
  const [indy] = res.data.heroes;
  t.is(indy.name, 'Indiana Jones');
});

test('uppercase name', async t => {
  const source = `
    query {
      heroes(name: "indiana jones") {
        name(shouldUppercase: true)
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue: heroRootObject });
  const [indy] = res.data.heroes;
  t.is(indy.name, 'INDIANA JONES');
});

test('get hero by power', async t => {
  const source = `
    query {
      heroes(power: "strength") {
        name
        powers
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue: heroRootObject });
  t.is(res.data.heroes.every(h => h.powers.includes('strength')), true);
});

test('get random hero', async t => {
  const source = `
    query {
      randomHero {
        name
      }
    }
  `;
  const res = await graphql({ schema, source, rootValue: heroRootObject });
  t.is(typeof res.data.randomHero.name, 'string');
});
