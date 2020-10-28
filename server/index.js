const makeServer = require('./makeServer');
const makeAuthServer = require('./makeAuthServer');
const { makePgClient, makeMongoClient } = require('./db');

makePgClient()
  // makeMongoClient()
  .then(connection => {
    return connection.makeCollection();
  })
  .then(users => {
    makeServer(3000);
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
