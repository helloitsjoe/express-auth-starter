const { MongoClient } = require('mongodb');
const makeServer = require('./makeServer');
const makeAuthServer = require('./makeAuthServer');
// const { makeDb } = require('./services');

MongoClient.connect('mongodb://0.0.0.0:27017/auth?useUnifiedTopology=true')
  .then(client => {
    console.log('Connected to DB!');

    const db = client.db('auth');

    makeServer();
    makeAuthServer(3001, db);
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
