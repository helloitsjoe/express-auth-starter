/* eslint-disable camelcase */
const bcrypt = require('bcrypt');
const express = require('express');
const { generateRandom, makeResponse, ONE_HOUR_IN_SECONDS } = require('./utils');

const router = express.Router();

const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || ONE_HOUR_IN_SECONDS;
const SALT_ROUNDS = 1;

const handleSignUp = async ({ username, password }, db) => {
  const { users, tokens } = db;
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }
  if (users.has(username)) {
    return makeResponse({ message: 'Username already exists', status: 401 });
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS).catch(console.error);
  const token = generateRandom(50);

  users.set(username, { hash });
  tokens.set(token, { username, expires_in: TOKEN_EXPIRATION });

  return makeResponse({ token });
};

const handleLogin = async ({ username, password }, db) => {
  const { users, tokens } = db;
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }
  if (!users.has(username)) {
    return makeResponse({ message: 'Username does not exist', status: 401 });
  }

  const valid = await bcrypt.compare(password, users.get(username).hash);

  if (!valid) {
    return makeResponse({ message: 'Username and password do not match', status: 401 });
  }
  const token = generateRandom(50);
  // TODO: Make expired error
  tokens.set(token, { username, expires_in: TOKEN_EXPIRATION });
  return makeResponse({ token });
};

router.post('/signup', async (req, res) => {
  const { status, ...rest } = await handleSignUp(req.body, req.db);
  res.status(status).json(rest);
});

router.post('/login', async (req, res) => {
  const { status, ...rest } = await handleLogin(req.body, req.db);
  res.status(status).json(rest);
});

router.post('/secure', (req, res) => {
  const { authorization } = req.headers;
  const { tokens } = req.db;
  // TODO: Middleware for removing bearer and checking username/password
  const token = authorization && authorization.split('Bearer ')[1];
  if (!tokens.has(token)) {
    return res.status(403).json({ message: 'Unauthorized!' });
  }
  // TODO: check expiration
  const { username } = tokens.get(token);

  return res.json({ message: `Hello from session auth, ${username}!` });
});

router.post('/revoke', (req, res) => {
  // TODO: admin auth
  const { tokens } = req.db;
  const { token } = req.body;
  // eslint-disable-next-line no-restricted-syntax
  if (!tokens.has(token)) {
    return res.status(404).json({ message: 'Token not found!' });
  }

  tokens.delete(token);
  return res.json({ token });
});

module.exports = router;
