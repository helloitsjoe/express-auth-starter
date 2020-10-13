/* eslint-disable import/prefer-default-export */

export const makeTestDb = () => {
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
    for (let entry of mockDb) {
      if (entry[key] === query[key]) {
        // This expects all records to be objects. TODO: update to handle arrays
        entry = { ...entry, ...update };
        return Promise.resolve(entry);
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
