const express = require('express');
const path = require('path');
const http = require('http');
const index = require('./routes/index');
const graphql = require('./routes/graphql');

const app = express();
const server = http.createServer(app);

// body-parser
// cors

const makeServer = async (port = 3000) => {
  app.use(express.static(path.join(__dirname, '../public')));

  // app.use('*', auth);
  app.use('/', index);
  app.use('/graphql', graphql);

  // App is already listening
  if (server.address()) return Promise.resolve(server);

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`Server listening on localhost:${port}`);
      return resolve(server);
    });

    server.on('error', e => {
      console.error(e);
      reject(e);
    });
  });
};

module.exports = makeServer;
