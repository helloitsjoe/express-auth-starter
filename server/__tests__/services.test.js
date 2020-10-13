const { makeTestDb } = require('../services');

let db;

beforeEach(() => {
  db = makeTestDb();
});

afterEach(() => {
  db = null;
});

it('inserts and finds', async () => {
  const none = await db.find({ foo: 'bar' });
  expect(none).toEqual([]);

  await db.insertOne({ foo: 'bar', baz: 'qux' });
  const found = await db.find({ foo: 'bar' });
  expect(found).toEqual([{ foo: 'bar', baz: 'qux' }]);
});

it('updates', async () => {
  await db.insertOne({ foo: 'bar' });
  const updated = await db.updateOne({ foo: 'bar' }, { foo: 'baz' });
  expect(updated).toEqual({ foo: 'baz' });
});

it('deletes', async () => {
  await db.insertOne({ foo: 'bar', baz: 'qux' });
  const deleted = await db.deleteOne({ foo: 'bar' });
  expect(deleted).toEqual(true);

  const found = await db.find({ foo: 'bar' });
  expect(found).toEqual([]);
});
