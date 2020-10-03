const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const oauth = require('./routes/oauth');
const session = require('./routes/session');
const jwt = require('./routes/jwt');
const { makeDbMiddleware } = require('./dbMiddleware');

const makeAuthServer = async (port = 3001, db) => {
  const app = express();
  const server = http.createServer(app);

  app.use(express.static(path.join(__dirname, '../public/oauth')));
  app.use(cors());
  app.use(bodyParser.json());
  app.use(makeDbMiddleware(db));

  // TODO: Consolidate session and jwt?
  app.use('/jwt', jwt);
  app.use('/session', session);
  app.use('/oauth', oauth);

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`Auth Server listening on http://localhost:${server.address().port}`);
      return resolve(server);
    });

    server.on('error', e => {
      console.error(e);
      reject(e);
    });
  });
};

module.exports = makeAuthServer;
