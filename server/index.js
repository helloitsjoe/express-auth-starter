const makeServer = require('./makeServer');
const makeAuthServer = require('./makeAuthServer');
const { makeCollection, makeDbClient } = require('./services');

makeDbClient(process.env.DB_URL)
  .then(connection => {
    console.log('Connected to Mongo');
    makeServer(3000);
    makeAuthServer(3001, { users: makeCollection(connection.db('auth').collection('users')) });
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
