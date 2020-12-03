import { Request, Response } from 'express';
import { DB } from './db';

export interface User {
  username: string;
}

export interface RequestBody {
  username: string;
  password: string;
}

export interface Handler {
  (login: RequestBody, users: DB): Promise<AuthServerResponse>;
}

export interface DBContext {
  users: DB;
}

interface AuthInput {
  message?: string;
  token?: string;
}

export type AuthServerInput = AuthInput & { status?: number };
export type AuthServerResponse = AuthInput & { status: number };

// export interface AuthRequest extends Request {
//   db: DBContext;
//   user: User;
// }

export interface AuthError extends Error {
  statusCode?: number;
}

// export interface AuthHandler {
//   (req: AuthRequest, res: Response, next: (err?: Error) => void): void;
// }
// export interface AuthErrorHandler {
//   (err: AuthError, req: AuthRequest, res: Response, next: (err?: Error) => void): void;
// }

export interface JWTBody {
  username: string;
}
