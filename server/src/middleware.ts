import { Handler, ErrorRequestHandler } from 'express';
import { DBContext } from './types';

export const makeDbMiddleware = (db: DBContext): Handler => (req, res, next) => {
  req.db = db;
  next();
};

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  const { statusCode, message } = err;
  return res.status(statusCode).json({ message });
};
