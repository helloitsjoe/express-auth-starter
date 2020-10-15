const { makeCollection } = require('../services');

let db;

beforeEach(() => {
  db = makeCollection();
});

afterEach(() => {
  db = null;
});

it('inserts and finds', async () => {
  const none = await db.findOne({ foo: 'bar' });
  expect(none).toEqual(undefined);

  await db.insertOne({ foo: 'bar', baz: 'qux' });
  const found = await db.findOne({ foo: 'bar' });
  expect(found).toEqual({ foo: 'bar', baz: 'qux' });
});

it('updates', async () => {
  await db.insertOne({ id: 1, foo: 'bar' });
  const updated = await db.updateOne({ id: 1 }, { foo: 'baz' });
  expect(updated).toEqual({ id: 1, foo: 'baz' });
  const found = await db.findOne({ id: 1 });
  expect(found.foo).toBe('baz');
});

it('deletes', async () => {
  await db.insertOne({ foo: 'bar', baz: 'qux' });
  const deleted = await db.deleteOne({ foo: 'bar' });
  expect(deleted).toEqual(true);

  const found = await db.findOne({ foo: 'bar' });
  expect(found).toEqual(undefined);
});
