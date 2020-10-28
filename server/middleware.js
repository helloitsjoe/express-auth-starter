const jwt = require('jsonwebtoken');

const makeDbMiddleware = db => (req, res, next) => {
  req.db = db;
  next();
};

const jwtMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    const error = new Error('Authorization header is required');
    error.statusCode = 403;
    next(error);
  }
  try {
    // JWT has build in expiration check
    const token = authorization.split('Bearer ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { username: decoded.username };
    next();
  } catch (err) {
    err.statusCode = 403;
    err.message = `Unauthorized! ${err.message}`;
    next(err);
  }
};

const sessionMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;
  const { users } = req.db;
  const token = authorization && authorization.split('Bearer ')[1];
  const user = await users.findOne({ token });

  if (!user) {
    const error = new Error('Unauthorized!');
    error.statusCode = 403;
    next(error);
  }
  req.user = user;
  next();
};

const errorMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  next(err);
  const { statusCode, message } = err;
  return res.status(statusCode).json({ message });
};

module.exports = { makeDbMiddleware, errorMiddleware, sessionMiddleware, jwtMiddleware };
