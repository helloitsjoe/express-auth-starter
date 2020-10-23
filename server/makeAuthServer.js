const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const oauth = require('./routes/oauth');
const session = require('./routes/session');
const jwt = require('./routes/jwt');
const { makeDbMiddleware, errorMiddleware } = require('./middleware');

const makeAuthServer = async (port = 3001, db) => {
  const app = express();
  const server = http.createServer(app);

  app.use(express.static(path.join(__dirname, '../public/oauth')));
  app.use(cors());
  app.use(bodyParser.json());
  app.use(makeDbMiddleware(db));

  app.use('/jwt', jwt);
  app.use('/session', session);
  app.use('/oauth', oauth);

  app.use(errorMiddleware);

  return new Promise((resolve, reject) => {
    server.on('error', e => {
      console.error(e);
      reject(e);
    });

    server.listen(port, () => {
      console.log(`Auth Server listening on http://localhost:${server.address().port}`);
      return resolve(server);
    });
  });
};

module.exports = makeAuthServer;
