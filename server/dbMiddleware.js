const makeDb = () => ({ users: new Map() });

const makeDbMiddleware = db => (req, res, next) => {
  req.context = { ...req.context, db };
  next();
};

module.exports = { makeDbMiddleware, makeDb };
