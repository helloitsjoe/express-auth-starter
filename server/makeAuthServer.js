const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const oauth = require('./routes/oauth');
const login = require('./routes/login');

const app = express();
const server = http.createServer(app);

// cors

const makeAuthServer = async (port = 3001) => {
  app.use(express.static(path.join(__dirname, '../public/oauth')));
  app.use(cors());
  app.use(bodyParser.json());

  app.use('/oauth', oauth);
  app.use('/login', login);

  // App is already listening
  if (server.address()) return Promise.resolve(server);

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`Auth Server listening on localhost:${port}`);
      return resolve(server);
    });

    server.on('error', e => {
      console.error(e);
      reject(e);
    });
  });
};

module.exports = makeAuthServer;
