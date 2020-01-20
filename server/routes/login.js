const express = require('express');

const router = express.Router();

const makeResponse = (message, status = 200) => ({ message, status });

const handleLogin = ({ username, password }) => {
  if (username && password) {
    return makeResponse(`Username: ${username} | Password: ${password}`);
  }
  return makeResponse('Username and password are both required.', 401);
};

router.post('/', (req, res) => {
  const { status, message } = handleLogin(req.body);
  console.log(status, message);
  res.status(status).end(JSON.stringify(message));
});

module.exports = router;
