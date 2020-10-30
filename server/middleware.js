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

const simpleTokenMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;
  const { users } = req.db;
  console.log(`authorization:`, authorization);
  const token = authorization && authorization.split('Bearer ')[1];
  const user = await users.findOne({ token });
  console.log(`user:`, user);
  if (!user) {
    const error = new Error('Unauthorized!');
    error.statusCode = 403;
    next(error);
  }
  req.user = user;
  next();
};

const makeError = (status = 403, message = 'Unauthorized!') => {
  const error = new Error(message);
  error.statusCode = status;
  return error;
};

const sessionMiddleware = async (req, res, next) => {
  // req.session.id is set from cookie in expressSession
  req.sessionStore.get(req.session.id, async (err, session) => {
    if (err) return next(err);
    if (!session) return next(makeError());

    const user = await req.db.users.findOne({ token: session.user });

    if (!user) return next(makeError(404, 'User not found'));

    req.user = user;
    next();
  });
};

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  const { statusCode, message } = err;
  return res.status(statusCode).json({ message });
};

module.exports = {
  makeDbMiddleware,
  errorMiddleware,
  sessionMiddleware,
  jwtMiddleware,
  simpleTokenMiddleware,
};
