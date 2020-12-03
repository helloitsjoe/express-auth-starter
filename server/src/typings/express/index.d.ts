import { DBContext, User } from '../../types';
import { Store } from 'express-session';

declare global {
  namespace Express {
    interface Request {
      user: User;
      db: DBContext;
      session?: Session;
      sessionStore: Store;
    }

    interface SessionData {
      user?: string;
    }
  }
}
