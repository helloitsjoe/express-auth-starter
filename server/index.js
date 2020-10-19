require('dotenv').config();
const makeServer = require('./makeServer');
const makeAuthServer = require('./makeAuthServer');
const { makeCollection, makeTable, makeDbClient } = require('./services');

makeDbClient(process.env.DB_URL)
  .then(connection => {
    console.log('Connected to DB');
    console.log(`connection:`, connection);
    makeServer(3000);
    // makeAuthServer(3001, { users: makeCollection(connection.db('auth').collection('users')) });
    return makeTable('users');
  })
  .then(users => {
    makeAuthServer(3001, { users });
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
