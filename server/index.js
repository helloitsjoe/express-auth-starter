const { MongoClient } = require('mongodb');
const makeServer = require('./makeServer');
const makeAuthServer = require('./makeAuthServer');
const { makeCollection } = require('./services');

const MONGO_HOST = process.env.MONGO_HOST || 'localhost';

MongoClient.connect(`mongodb://${MONGO_HOST}:27017/auth?useUnifiedTopology=true`)
  .then(client => {
    console.log('Connected to DB!');

    const db = client.db('auth');

    makeServer(3000);
    makeAuthServer(3001, { users: makeCollection(db.collection('users')) });
  })
  .catch(err => {
    console.error('Error connecting to DB:', err);
  });

// Handle Ctrl-C
process.on('SIGINT', () => {
  console.info('Interrupted');
  process.exit(0);
});

// Handle docker-compose shutdown
process.on('SIGTERM', () => {
  console.info('Terminating');
  process.exit(0);
});
