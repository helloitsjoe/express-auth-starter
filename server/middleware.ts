import { Request, Response, RequestHandler, ErrorRequestHandler } from 'express';
import * as jwt from 'jsonwebtoken';
import { DBContext, AuthHandler, AuthError, JWTBody, AuthErrorHandler } from './types';

export const makeDbMiddleware = (db: DBContext): AuthHandler => (req, res, next) => {
  req.db = db;
  next();
};

export const jwtMiddleware: AuthHandler = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    const error = new Error('Authorization header is required') as AuthError;
    error.statusCode = 403;
    return next(error);
  }
  try {
    // JWT has build in expiration check
    const token = authorization.split('Bearer ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JWTBody;
    req.user = { username: decoded.username };
    next();
  } catch (err) {
    err.statusCode = 403;
    err.message = `Unauthorized! ${err.message}`;
    next(err);
  }
};

export const simpleTokenMiddleware: AuthHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  const { users } = req.db;
  const token = authorization ? authorization.split('Bearer ')[1] : '';
  const user = await users.findOne({ token });

  if (!user) {
    const error = new Error('Unauthorized!') as AuthError;
    error.statusCode = 403;
    return next(error);
  }

  if (user.expiration! < Date.now()) {
    const error = new Error('Token is expired') as AuthError;
    error.statusCode = 403;
    return next(error);
  }

  req.user = user;
  next();
};

export const makeError = (status = 403, message = 'Unauthorized!') => {
  const error = new Error(message) as AuthError;
  error.statusCode = status;
  return error;
};

export const sessionMiddleware: AuthHandler = async (req, res, next) => {
  // req.session is set from cookie in expressSession
  if (!req.session.user) return next(makeError(403, 'Session expired'));

  req.session.store.get(req.session.id, async (err, session) => {
    if (err) return next(err);
    if (!session) return next(makeError());

    const user = await req.db.users.findOne({ token: session.user });

    if (!user) return next(makeError(404, 'User not found'));

    req.user = user;
    next();
  });
};

// eslint-disable-next-line no-unused-vars
export const errorMiddleware: AuthErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  const { statusCode, message } = err;
  return res.status(statusCode).json({ message });
};

// module.exports = {
//   makeDbMiddleware,
//   errorMiddleware,
//   sessionMiddleware,
//   jwtMiddleware,
//   simpleTokenMiddleware,
// };
