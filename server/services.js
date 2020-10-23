/* eslint-disable camelcase */
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { Client } = require('pg');

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
  const clearAll = () => collection.deleteMany({});

  return { insertOne, findOne, updateOne, deleteOne, clearAll };
};

const makePgApi = client => {
  const insertOne = async ({ username, hash, token, expires_in }) => {
    const query =
      'INSERT INTO users(username, hash, token, expires_in) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [username, hash, token, expires_in];
    const users = await client.query(query, values);
    return users.rows[0];
  };

  const findOne = async ({ username }) => {
    const users = await client.query(`SELECT * FROM users WHERE username = $1`, [username]);
    return users.rows[0] || null;
  };

  const updateOne = async ({ username }, { token, expires_in }) => {
    const updateQuery =
      'UPDATE users SET (token, expires_in) = ($1, $2) WHERE username = $3 RETURNING *';
    const values = [token, expires_in, username];
    const users = await client.query(updateQuery, values);
    return { modifiedCount: users.rows.length };
  };

  const deleteOne = async ({ username }) => {
    await client.query('DELETE FROM users WHERE username = $1', [username]);
  };

  const clearAll = async () => client.query('TRUNCATE users');

  return { insertOne, findOne, updateOne, deleteOne, clearAll };
};

const makeCollection = connection => makeMongoApi(connection.db().collection('users'));

const makeTable = async client => {
  await client.query(
    `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(64) NOT NULL,
      hash VARCHAR(64) NOT NULL,
      token VARCHAR(64),
      expires_in INT
    );
  `
  );
  return makePgApi(client);
};

const makeMongoClient = async () => {
  const dbUrl = process.env.MONGO_URL;
  const connection = await MongoClient.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB!');
  connection.makeCollection = () => makeCollection(connection);
  return connection;
};

const makePgClient = async () => {
  const { PGUSER, PGPASSWORD, PGDATABASE, PGHOST } = process.env;
  const url = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:5432/${PGDATABASE}`;
  const client = new Client({ connectionString: url });
  await client.connect();
  console.log(`Connected to Postgres!`);

  const dbCheck = await client.query("SELECT FROM pg_database WHERE datname = 'auth'");
  if (!dbCheck.rowCount) {
    console.log('Creating DB...');
    await client.query(`CREATE DATABASE auth;`);
  }

  client.close = client.end;
  client.makeCollection = () => makeTable(client);
  return client;
};

module.exports = { makeMongoClient, makePgClient, makeTestDbApi };
