import makeServer from './makeServer';
import makeAuthServer from './makeAuthServer';
import { makePgClient, makeMongoClient } from './db';

makePgClient()
  // makeMongoClient()
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
