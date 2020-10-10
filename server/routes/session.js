/* eslint-disable camelcase */
const express = require('express');
const { generateRandom, makeResponse, ONE_HOUR_IN_SECONDS } = require('./utils');

const router = express.Router();

// const tokens = new Map();

const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || ONE_HOUR_IN_SECONDS;

const handleSignUp = ({ username, password }, users) => {
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }
  const token = generateRandom(50);
  return makeResponse({ token });
};

const handleLogin = ({ username, password }, users) => {
  // TODO: Check password
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }
  const token = generateRandom(50);
  // TODO: Make expired error
  const expires_in = TOKEN_EXPIRATION;
  users.set(token, { username, expires_in });
  return makeResponse({ token });
};

router.post('/signup', (req, res) => {
  const { status, ...rest } = handleSignUp(req.body, req.context.db.users);
  res.status(status).json(rest);
});

router.post('/login', (req, res) => {
  const { status, ...rest } = handleLogin(req.body, req.context.db.users);
  res.status(status).json(rest);
});

router.post('/secure', (req, res) => {
  const { authorization } = req.headers;
  const { users } = req.context.db;
  // TODO: Middleware for removing bearer and checking username/password
  const token = authorization && authorization.split('Bearer ')[1];
  if (!users.has(token)) {
    return res.status(403).json({ message: 'Unauthorized!' });
  }
  // TODO: check expiration
  const { username } = users.get(token);
  return res.json({ message: `Hi from session auth, ${username}!` });
});

module.exports = router;
