const makeTestDb = () => {
  let mockDb = [];

  const insertOne = data => {
    mockDb.push(data);
    return Promise.resolve(data);
  };

  const find = query => {
    // TODO: Match more than the first key
    const key = Object.keys(query)[0];
    const found = mockDb.filter(entry => entry[key] === query[key]);
    return Promise.resolve(found);
  };

  const updateOne = async (query, update) => {
    const key = Object.keys(query)[0];
    // eslint-disable-next-line no-restricted-syntax
    for (const [i, entry] of mockDb.entries()) {
      if (entry[key] === query[key]) {
        // This expects all records to be objects. TODO: update to handle arrays
        mockDb[i] = { ...entry, ...update };
        return Promise.resolve(mockDb[i]);
      }
    }
    return Promise.resolve();
  };

  const deleteOne = query => {
    const key = Object.keys(query)[0];
    mockDb = mockDb.filter(entry => entry[key] !== query[key]);
    return Promise.resolve(true);
  };

  return { insertOne, find, updateOne, deleteOne };
};

const makeMongoDb = collection => {
  const insertOne = data => collection.insertOne(data);
  const find = query => collection.find(query).toArray();
  const updateOne = (query, update) => collection.updateOne(query, { $set: update });
  const deleteOne = query => collection.deleteOne(query);

  return { insertOne, find, updateOne, deleteOne };
};

const makeCollection = collection => {
  return collection ? makeMongoDb(collection) : makeTestDb();
};

module.exports = { makeCollection };
