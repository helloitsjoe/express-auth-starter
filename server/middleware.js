const makeDbMiddleware = db => (req, res, next) => {
  req.db = db;
  next();
};

const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  next(err);
};

module.exports = { makeDbMiddleware, errorMiddleware };
