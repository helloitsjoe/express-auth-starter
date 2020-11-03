/* eslint-disable camelcase */
const bcrypt = require('bcrypt');
const express = require('express');
const { simpleTokenMiddleware } = require('../middleware');
const { generateRandom, makeResponse, ONE_HOUR_IN_SECONDS } = require('../utils');

const router = express.Router();

const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || ONE_HOUR_IN_SECONDS;
const SALT_ROUNDS = 1;

const handleSignUp = async ({ username, password }, db) => {
  const { users } = db;
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }

  const user = await users.findOne({ username });

  if (user) {
    return makeResponse({ message: 'Username already exists', status: 401 });
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS).catch(console.error);
  const token = generateRandom(50);
  await users.insertOne({ username, hash, token, expires_in: TOKEN_EXPIRATION });

  return makeResponse({ token });
};

const handleLogin = async ({ username, password }, db) => {
  const { users } = db;
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
  await users.updateOne({ username }, { token, expires_in: TOKEN_EXPIRATION });
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

router.post('/secure', simpleTokenMiddleware, async (req, res) => {
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

module.exports = router;
