import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as expressSession from 'express-session';
import jwt from './routes/jwt';
import oauth from './routes/oauth';
import session from './routes/session';
import simpleToken from './routes/simpleToken';
import { makeDbMiddleware, errorMiddleware } from './middleware';
import { DBContext } from './types';
import { getTokenExp } from './utils';

const makeAuthServer = async (port = 3001, db: DBContext) => {
  const app = express();
  const server = http.createServer(app);

  // HTML and API need to live on the same port for session auth, haven't
  // figured out how to get cross-domain cookies working yet.
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(cors());
  app.use(bodyParser.json());
  app.use(
    expressSession({
      secret: process.env.EXPRESS_SESSION_SECRET || '',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: getTokenExp() * 1000,
      },
    })
  );
  app.use(makeDbMiddleware(db));

  app.use('/jwt', jwt);
  app.use('/session', session);
  app.use('/simple-token', simpleToken);
  app.use('/oauth', oauth);

  app.use(errorMiddleware);

  return new Promise((resolve, reject) => {
    server.on('error', e => {
      console.error(e);
      reject(e);
    });

    server.listen(port, () => {
      console.log(`Auth Server listening on http://localhost:${port}`);
      return resolve(server);
    });
  });
};

export default makeAuthServer;
