// This example is based on http://thecodebarbarian.com/oauth-with-node-js-and-express.html
const express = require('express');
const path = require('path');
const crypto = require('crypto');

// Store codes and tokens in memory. In a real server this would use a DB
const authCodes = new Set();
const accessTokens = new Set();

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

const generateRandom = len => {
  const rand = crypto
    .randomBytes(len)
    .toString('base64')
    .replace(/[/+=]/g, '')
    // length in bytes is greater than string length
    .slice(0, len);

  return rand;
};

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'oauth-dialog.html'));
});

router.get('/code', (req, res) => {
  console.log('getting code...');
  const authCode = generateRandom(10);

  authCodes.add(authCode);

  // Normally this would use a `redirect_uri` parameter
  res.redirect(`http://localhost:3000/oauth-callback.html?code=${authCode}`);
});

router.post('/token', (req, res) => {
  console.log(`generating token...`);
  const { code } = req.body;
  if (authCodes.has(code)) {
    const token = generateRandom(50);

    authCodes.delete(code);
    accessTokens.add(token);

    return res.json({ access_token: token, expires_in: ONE_DAY_IN_SECONDS });
  }
  return res.status(400).json({ message: 'Invalid auth token' });
});

router.get('/secure', (req, res) => {
  if (!accessTokens.has(req.get('authorization'))) {
    return res.status(403).json({ message: 'Unauthorized!' });
  }
  return res.json({ message: 'You are in' });
});

router.post('/secure', (req, res) => {
  const authorization = req.get('authorization');
  if (!accessTokens.has(authorization)) {
    return res.status(403).json({ message: 'Unauthorized!' });
  }
  const { message } = req.body;
  console.log('secure message', message);
  return res.json({ message: `${message} right back atcha` });
});

module.exports = router;
