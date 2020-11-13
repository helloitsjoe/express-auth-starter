/* eslint-disable camelcase */
import * as bcrypt from 'bcrypt';
import * as express from 'express';
import { simpleTokenMiddleware } from '../middleware';
import { generateRandom, makeResponse, getTokenExp } from '../utils';
import { AuthRequest, Handler } from '../types';

const router = express.Router();

const SALT_ROUNDS = 1;

const handleSignUp: Handler = async ({ username, password }, users) => {
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }

  const user = await users.findOne({ username });

  if (user) {
    return makeResponse({ message: 'Username already exists', status: 401 });
  }

  const hash = (await bcrypt.hash(password, SALT_ROUNDS).catch(console.error)) || '';
  const token = generateRandom(50);

  // Note: This will be a timestamp without a timezone. Better to use an ISO string.
  await users.insertOne({ username, hash, token, expiration: Date.now() + getTokenExp() * 1000 });

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
  // TODO: Make expired error
  await users.updateOne({ username }, { token, expiration: Date.now() + getTokenExp() * 1000 });
  return makeResponse({ token });
};

router.post('/signup', async (req, res) => {
  const { status, ...rest } = await handleSignUp(req.body, req.db.users);
  res.status(status).json(rest);
});

router.post('/login', async (req, res) => {
  const { status, ...rest } = await handleLogin(req.body, req.db.users);
  res.status(status).json(rest);
});

router.get('/login', simpleTokenMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

router.post('/secure', simpleTokenMiddleware, async (req: AuthRequest, res) => {
  // TODO: check expiration
  return res.json({ message: `Hello from simple-token auth, ${req.user.username}!` });
});

router.post('/logout', async (req, res) => {
  // TODO: admin auth
  const { users } = req.db;
  const { token } = req.body;

  const user = await users.findOne({ token });

  if (!user) {
    return res.status(404).json({ message: 'Token not found!' });
  }

  const { username } = user;
  await users.updateOne({ username }, { token: null, expires_in: null });
  // const userAfter = await users.findOne({ token });

  return res.json({ token });
});

export default router;
