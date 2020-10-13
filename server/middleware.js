const makeDb = () => ({ users: new Map(), tokens: new Map() });

const makeDbMiddleware = db => (req, res, next) => {
  req.context = { ...req.context, db };
  next();
};

const makeErrorMiddleware = () => (err, req, res, next) => {
  console.error(err);
  next(err);
};

module.exports = { makeDbMiddleware, makeDb, makeErrorMiddleware };
