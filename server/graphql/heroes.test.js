import test from 'ava';
import { heroRoot } from './heroes';

// Examples of resolver unit tests
test('gets random hero', t => {
  const { name, powers } = heroRoot.randomHero();
  const powersAreStrings = powers.every(p => typeof p === 'string');
  t.is(typeof name, 'string');
  t.is(powersAreStrings, true);
});

test('gets heroes by power', t => {
  const strongHeroes = heroRoot.getByPower({ power: 'strength' });
  const names = strongHeroes.map(({ name }) => name);
  t.deepEqual(names, ['Mr. Incredible', 'Mrs. Incredible', 'Jack-Jack']);
});
