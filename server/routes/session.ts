import * as bcrypt from 'bcrypt';
import * as express from 'express';
import { sessionMiddleware } from '../middleware';
import { generateRandom, makeResponse } from '../utils';
import { Handler } from '../types';
import { DB } from '../db';

const router = express.Router();

const SALT_ROUNDS = 1;

const handleSignUp: Handler = async ({ username, password }, users: DB) => {
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }

  const user = await users.findOne({ username });

  if (user) {
    return makeResponse({ message: 'Username already exists', status: 401 });
  }

  const hash = (await bcrypt.hash(password, SALT_ROUNDS).catch(console.error)) || '';
  const token = generateRandom(50);

  await users.insertOne({ username, hash, token });

  // const session = { user };

  return makeResponse({ token });
};

const handleLogin: Handler = async ({ username, password }, users) => {
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }

  const user = await users.findOne({ username });

  if (!user) {
    return makeResponse({ message: `Username ${username} does not exist`, status: 401 });
  }

  const valid = await bcrypt.compare(password, user.hash);

  if (!valid) {
    return makeResponse({ message: 'Username and password do not match', status: 401 });
  }
  const token = generateRandom(50);

  await users.updateOne({ username }, { token });
  return makeResponse({ token });
};

router.post('/signup', async (req, res, next) => {
  const { status, ...rest } = await handleSignUp(req.body, req.db.users);
  req.session.user = rest.token;
  req.sessionStore.set(req.session.id, req.session, err => {
    if (err) next(err);
    res.status(status).json(rest);
  });
});

router.post('/login', async (req, res, next) => {
  const { status, ...rest } = await handleLogin(req.body, req.db.users);
  req.session.user = rest.token;
  req.sessionStore.set(req.session.id, req.session, err => {
    if (err) next(err);
    res.status(status).json(rest);
  });
});

router.get('/login', sessionMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

router.post('/secure', sessionMiddleware, async (req, res) => {
  return res.json({ message: `Hello from session auth, ${req.user.username}!` });
});

router.post('/logout', async (req, res) => {
  // TODO: admin auth
  const { cookie } = req.headers;
  if (!cookie) return res.status(403).json({ message: 'No Session ID provided' });

  req.sessionStore.destroy(req.session.id, err => {
    if (err) return res.status(500).json({ message: err.message });
    return res.json({ message: 'You have been logged out' });
  });
});

export default router;
