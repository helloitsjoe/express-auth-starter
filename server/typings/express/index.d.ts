import { DBContext, User } from '../../types';
import { Store } from 'express-session';
// TODO: express-session 1.17 causes an issue here, upgrade after fixed
// import { InitializedSession, Session, Store } from 'express-session';

declare global {
  namespace Express {
    interface Request {
      user: User;
      db: DBContext;
      // session: Session | InitializedSession;
      session?: Express.Session;
    }

    interface SessionData {
      user?: string;
      store: Store;
    }
  }
}
