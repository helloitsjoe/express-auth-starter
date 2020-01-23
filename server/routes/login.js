const express = require('express');

const router = express.Router();

const makeResponse = (message, status = 200) => ({ message, status });

const handleLogin = ({ username, password }) => {
  const message = `Username: ${username} | Password: ${password}`;
  console.log(message);
  if (username && password) {
    return makeResponse(message);
  }
  return makeResponse('Username and password are both required.', 401);
};

router.post('/', (req, res) => {
  const { status, message } = handleLogin(req.body);
  console.log(status, message);
  res.status(status).json({ message });
});

router.post('/secure', (req, res) => {
  if (!req.user) return res.status(403).json({ message: 'Unauthorized!' });
});

module.exports = router;
