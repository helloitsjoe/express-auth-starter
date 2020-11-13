import { DBContext, AuthHandler, AuthErrorHandler } from './types';

export const makeDbMiddleware = (db: DBContext): AuthHandler => (req, res, next) => {
  req.db = db;
  next();
};

export const errorMiddleware: AuthErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  const { statusCode, message } = err;
  return res.status(statusCode).json({ message });
};
