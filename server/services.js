const makeTestDb = () => {
  let mockDb = [];

  const insertOne = data => {
    mockDb.push(data);
    return Promise.resolve(data);
  };

  const findOne = query => {
    // TODO: Match more than the first key
    const key = Object.keys(query)[0];
    const found = mockDb.find(entry => entry[key] === query[key]) || null;
    return Promise.resolve(found);
  };

  const updateOne = async (query, update) => {
    const key = Object.keys(query)[0];
    // eslint-disable-next-line no-restricted-syntax
    for (const [i, entry] of mockDb.entries()) {
      if (entry[key] === query[key]) {
        // This expects all records to be objects. TODO: update to handle arrays
        mockDb[i] = { ...entry, ...update };
        return Promise.resolve({ modifiedCount: 1 });
      }
    }
    return Promise.resolve({ modifiedCount: 0 });
  };

  const deleteOne = query => {
    const key = Object.keys(query)[0];
    mockDb = mockDb.filter(entry => entry[key] !== query[key]);
    return Promise.resolve({ deletedCount: 1 });
  };

  return { insertOne, findOne, updateOne, deleteOne };
};

const makeMongoDb = collection => {
  const insertOne = data => collection.insertOne(data);
  const findOne = query => collection.findOne(query);
  const updateOne = (query, update) => collection.updateOne(query, { $set: update });
  const deleteOne = query => collection.deleteOne(query);

  return { insertOne, findOne, updateOne, deleteOne };
};

const makeCollection = collection => {
  return collection ? makeMongoDb(collection) : makeTestDb();
};

module.exports = { makeCollection };
