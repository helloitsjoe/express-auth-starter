import { DBContext, User } from '../../types';
import { InitializedSession, Session, Store } from 'express-session';

declare global {
  namespace Express {
    interface Request {
      user: User;
      db: DBContext;
      session: Session | InitializedSession;
    }
  }
}
