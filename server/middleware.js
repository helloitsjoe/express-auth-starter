const makeDbMiddleware = db => (req, res, next) => {
  req.db = db;
  next();
};

const makeErrorMiddleware = () => (err, req, res, next) => {
  console.error(err);
  next(err);
};

module.exports = { makeDbMiddleware, makeErrorMiddleware };
