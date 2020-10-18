const { makeCollection, makeDbClient } = require('../services');

let db;
let connection;

// Tests have been extracted into functions, real and mock DBs run the same
// tests. This is to ensure mock DB doesn't fall out of sync with real DB
const testInsertAndFind = async () => {
  const none = await db.findOne({ foo: 'bar' });
  expect(none).toEqual(null);

  await db.insertOne({ _id: 'some-id', foo: 'bar', baz: 'qux' });
  const found = await db.findOne({ foo: 'bar' });
  expect(found).toEqual({ _id: 'some-id', foo: 'bar', baz: 'qux' });
};

const testUpdate = async () => {
  await db.insertOne({ _id: '1', foo: 'bar' });
  const updated = await db.updateOne({ _id: '1' }, { foo: 'baz' });
  expect(updated.modifiedCount).toBe(1);
  const found = await db.findOne({ _id: '1' });
  expect(found.foo).toBe('baz');
};

const testUpdateNotFound = async () => {
  const updated = await db.updateOne({ _id: '1' }, { foo: 'baz' });
  expect(updated.modifiedCount).toBe(0);
};

const testDelete = async () => {
  await db.insertOne({ foo: 'bar', baz: 'qux' });
  const deleted = await db.deleteOne({ foo: 'bar' });
  expect(deleted.deletedCount).toEqual(1);

  const found = await db.findOne({ foo: 'bar' });
  expect(found).toEqual(null);
};

describe('Mock DB', () => {
  beforeEach(() => {
    db = makeCollection();
  });

  afterEach(() => {
    db = null;
  });

  it('inserts and finds', testInsertAndFind);
  it('updates', testUpdate);
  it('update does not fail if no matching query', testUpdateNotFound);
  it('deletes', testDelete);
});

describe('Real DB', () => {
  beforeEach(async () => {
    connection = await makeDbClient(process.env.DB_URL);
    const collection = await connection.db().collection('foo');
    await collection.deleteMany({});
    db = makeCollection(collection);
  });

  afterEach(async () => {
    await connection.close();
    db = null;
  });

  it('inserts and finds', testInsertAndFind);
  it('updates', testUpdate);
  it('update does not fail if no matching query', testUpdateNotFound);
  it('deletes', testDelete);
});
