/* eslint-disable camelcase */
const express = require('express');

const { generateRandom, ONE_DAY_IN_SECONDS } = require('./utils');

const router = express.Router();

const makeResponse = ({ message, token, expires_in, status = 200 }) => ({
  message,
  status,
  token,
  expires_in,
});

const tokens = new Set();

const handleLogin = ({ username, password }) => {
  const message = `Username: ${username} | Password: ${password}`;
  console.log(message);
  if (!username || !password) {
    return makeResponse({ message: 'Username and password are both required.', status: 401 });
  }
  const token = generateRandom(50);
  const expires_in = ONE_DAY_IN_SECONDS;
  tokens.add(token);
  return makeResponse({ token, expires_in });
};

router.post('/login', (req, res) => {
  const { status, ...rest } = handleLogin(req.body);
  console.log(status, rest);
  res.status(status).json(rest);
});

router.post('/secure', (req, res) => {
  if (!req.user) return res.status(403).json({ message: 'Unauthorized!' });
  return res.json({ message: 'hi' });
});

module.exports = router;
