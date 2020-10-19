/* eslint-disable camelcase */
// const { MongoClient } = require('mongodb');
const { Client } = require('pg');

const client = new Client();

const makeTestDbApi = () => {
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

const makeMongoApi = collection => {
  const insertOne = data => collection.insertOne(data);
  const findOne = query => collection.findOne(query);
  const updateOne = (query, update) => collection.updateOne(query, { $set: update });
  const deleteOne = query => collection.deleteOne(query);

  return { insertOne, findOne, updateOne, deleteOne };
};

const makePgApi = tblName => {
  // create table from tblName
  const insertOne = async ({ username, hash, token, expires_in }) => {
    const users = await client.query(
      `INSERT INTO users(username, hash, token, expires_in) VALUES($1, $2, $3, $4) RETURNING *`,
      [username, hash, token, expires_in]
    );
    return users.rows[0];
  };

  const findOne = async ({ username }) => {
    const users = await client.query(`SELECT * FROM users WHERE username = $1`, [username]);
    return users.rows[0];
  };

  const updateOne = async ({ username }, { token, expires_in }) => {
    const users = await client.query(
      'UPDATE users SET (token, expires_in) = ($1, $2) WHERE username = $3 RETURNING *',
      [token, expires_in, username]
    );
    return users.rows[0];
  };

  // const deleteOne = query => client.query('DELETE FROM users WHERE u');

  return { insertOne, findOne, updateOne };
};

const makeCollection = collection => {
  return collection ? makeMongoApi(collection) : makeTestDbApi();
};

const makeTable = async name => {
  const table = await client.query(
    `
    CREATE TABLE IF NOT EXISTS ${name} (
      id SERIAL PRIMARY KEY,
      username VARCHAR(64) NOT NULL,
      hash VARCHAR(64) NOT NULL,
      token VARCHAR(64),
      expires_in INT
    );
  `
  );
  return table ? makePgApi(table) : makeTestDbApi();
};

const makeDbClient = async () => {
  // const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/auth';
  // return MongoClient.connect(dbUrl, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // });

  await client.connect();
  const foo = await client.query("SELECT FROM pg_database WHERE datname = 'auth'");
  if (!foo.rowCount) {
    console.log('Creating DB...');
    await client.query(`CREATE DATABASE auth;`);
  }
};

module.exports = { makeCollection, makeDbClient, makeTable };
