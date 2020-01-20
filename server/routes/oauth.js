const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'oauth-dialog.html'));
});

router.get('/code', (req, res) => {
  console.log('getting code...');
  // const authCode = new Array(10)
  //   .fill(null)
  //   .map(() => Math.floor(Math.random() * 10))
  //   .join('');

  const authCode = 'secret';

  res.redirect(`http://localhost:3000/oauth-callback.html?code=${authCode}`);
});

module.exports = router;
