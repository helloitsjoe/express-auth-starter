const express = require('express');
// const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { ONE_HOUR_IN_SECONDS, makeResponse } = require('./utils');

const router = express.Router();

const SALT_ROUNDS = 1;

const EXPIRATION = process.env.TOKEN_EXPIRATION || ONE_HOUR_IN_SECONDS;

const handleSignUp = async ({ username, password }, users) => {
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }

  const user = await users.findOne({ username });

  if (user) {
    return makeResponse({ message: `Username ${username} is unavailable!`, status: 400 });
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS).catch(console.error);
  await users.insertOne({ username, hash });

  const token = jwt.sign({ username }, 'mysecret', { expiresIn: EXPIRATION });
  return makeResponse({ token });
};

const handleLogin = async ({ username, password }, users) => {
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }

  const user = await users.findOne({ username });

  if (!user) {
    return makeResponse({ message: `User ${username} does not exist`, status: 400 });
  }

  const valid = await bcrypt.compare(password, user.hash);
  if (!valid) {
    return makeResponse({ message: `Wrong password for user ${username}`, status: 401 });
  }

  const token = jwt.sign({ username }, 'mysecret', { expiresIn: EXPIRATION });
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

router.post('/secure', (req, res) => {
  // TODO: make this middleware for all secure routes
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(403).json({ message: 'Authorization header is required' });
  }
  try {
    const token = authorization.split('Bearer ')[1];
    // JWT has build in expiration check
    const decoded = jwt.verify(token, 'mysecret');
    return res.json({ message: `Hi from JWT, ${decoded.username}!` });
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(403).json({ message: `Unauthorized! ${err.message}` });
  }
});

module.exports = router;
