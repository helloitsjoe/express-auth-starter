const { makeMongoClient, makePgClient, makeTestDbApi } = require('../services');

let db;

afterEach(async () => {
  await db.closeConnection();
  db = null;
});

// Tests have been extracted into functions, real and mock DBs run the same
// tests. This is to ensure mock DB doesn't fall out of sync with real DB
const testInsertAndFind = async () => {
  const none = await db.findOne({ foo: 'bar' });
  expect(none).toEqual(null);

  await db.insertOne({ username: 'bar', hash: 'qux' });
  const found = await db.findOne({ username: 'bar' });
  expect(found.username).toBe('bar');
  expect(found.hash).toBe('qux');
};

const testUpdate = async () => {
  await db.insertOne({ username: 'foo', hash: 'bar' });
  const updated = await db.updateOne({ username: 'foo' }, { token: '123' });
  expect(updated.modifiedCount).toBe(1);
  const found = await db.findOne({ username: 'foo' });
  expect(found.hash).toBe('bar');
  expect(found.token).toBe('123');
};

const testUpdateNotFound = async () => {
  const updated = await db.updateOne({ username: 'foo' }, { foo: 'baz' });
  expect(updated.modifiedCount).toBe(0);
};

const testDelete = async () => {
  await db.insertOne({ username: 'foo', hash: 'bar' });
  await db.deleteOne({ username: 'foo' });

  const found = await db.findOne({ username: 'foo' });
  expect(found).toEqual(null);
};

describe('Mock DB', () => {
  beforeEach(() => {
    db = makeTestDbApi();
  });

  it('inserts and finds', testInsertAndFind);
  it('updates', testUpdate);
  it('update does not fail if no matching query', testUpdateNotFound);
  it('deletes', testDelete);
});

describe('Postgres DB', () => {
  beforeEach(async () => {
    db = await makePgClient();
    await db.clearAll();
  });

  it('inserts and finds', testInsertAndFind);
  it('updates', testUpdate);
  it('update does not fail if no matching query', testUpdateNotFound);
  it('deletes', testDelete);
});

describe('Mongo DB', () => {
  beforeEach(async () => {
    db = await makeMongoClient();
    await db.clearAll();
  });

  it('inserts and finds', testInsertAndFind);
  it('updates', testUpdate);
  it('update does not fail if no matching query', testUpdateNotFound);
  it('deletes', testDelete);
});
