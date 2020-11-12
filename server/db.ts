/* eslint-disable camelcase */
require('dotenv').config();
import { Collection, MongoClient } from 'mongodb';
import { Client } from 'pg';

interface Data {
  username: string;
  hash: string;
  token: string;
  expiration: string;
}

interface Query {
  username: string;
  token: string;
}

interface Update {
  token: string;
  expiration: string;
}

export interface DB {
  insertOne: (data: Data) => Promise<Data>;
  findOne: (query: Query) => Promise<Data | null>;
  // REMOVE_ANY
  updateOne: (query: Query, update: Update) => Promise<object>;
  deleteOne: (query: Query) => Promise<object>;
  clearAll: () => Promise<void>;
  closeConnection: () => Promise<void>;
}

export const makeTestDbApi = (): DB => {
  let mockDb: Data[] = [];

  const insertOne = (data: Data) => {
    mockDb.push(data);
    return Promise.resolve(data);
  };

  const findOne = (query: Query) => {
    // TODO: Match more than the first key
    const key = Object.keys(query)[0];
    const found = mockDb.find(entry => entry[key] === query[key]) || null;
    return Promise.resolve(found);
  };

  const updateOne = async (query: Query, update: Update) => {
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

  const deleteOne = (query: Query) => {
    const key = Object.keys(query)[0];
    mockDb = mockDb.filter(entry => entry[key] !== query[key]);
    return Promise.resolve({ deletedCount: 1 });
  };

  const clearAll = async () => {
    mockDb = [];
  };

  const closeConnection = async () => {};

  return { insertOne, findOne, updateOne, deleteOne, clearAll, closeConnection };
};

export const makeMongoApi = (client: MongoClient, collection: Collection): DB => {
  const insertOne = data => collection.insertOne(data);
  const findOne = query => collection.findOne(query);
  const updateOne = (query, update) => collection.updateOne(query, { $set: update });
  const deleteOne = query => collection.deleteOne(query);
  const clearAll = () => collection.deleteMany({});
  const closeConnection = () => client.close();

  return { insertOne, findOne, updateOne, deleteOne, clearAll, closeConnection };
};

export const makePgApi = (client): DB => {
  const insertOne = async ({ username, hash, token, expiration }) => {
    const query =
      'INSERT INTO users(username, hash, token, expiration) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [username, hash, token, expiration];
    const users = await client.query(query, values);
    return users.rows[0];
  };

  const findOne = async ({ username, token }) => {
    // TODO: make this cleaner
    const query = username ? 'username' : 'token';
    const users = await client.query(`SELECT * FROM users WHERE ${query} = $1`, [
      username || token,
    ]);
    return users.rows[0] || null;
  };

  const updateOne = async ({ username }, { token, expiration }) => {
    const updateQuery =
      'UPDATE users SET (token, expiration) = ($1, $2) WHERE username = $3 RETURNING *';
    const values = [token, expiration, username];
    const users = await client.query(updateQuery, values);
    return { modifiedCount: users.rows.length };
  };

  const deleteOne = async ({ username }) => {
    await client.query('DELETE FROM users WHERE username = $1', [username]);
  };

  const clearAll = async () => client.query('TRUNCATE users');
  const closeConnection = () => client.end();

  return { insertOne, findOne, updateOne, deleteOne, clearAll, closeConnection };
};

export const makeCollection = (connection: MongoClient) => connection.db().collection('users');

export const makeTable = async (client: Client) => {
  await client.query(
    `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(64) NOT NULL,
      hash VARCHAR(64) NOT NULL,
      token VARCHAR(64),
      expiration BIGINT
    );
  `
  );
  return client;
};

export const makeMongoClient = async () => {
  const dbUrl = process.env.MONGO_URL || '';
  const client = await MongoClient.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB!');

  const collection = await makeCollection(client);
  return makeMongoApi(client, collection);
};

export const makePgClient = async () => {
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

  const clientWithTable = await makeTable(client);
  return makePgApi(clientWithTable);
};

export const validateDbApi = (apiToTest: DB) => {
  const apiToOverride = [
    'updateOne',
    'findOne',
    'insertOne',
    'deleteOne',
    'clearAll',
    'closeConnection',
  ];
  apiToOverride.forEach(methodName => {
    if (typeof apiToTest[methodName] !== 'function') {
      throw new Error(`Function ${methodName} must be defined`);
    }
  });
  return apiToTest;
};
