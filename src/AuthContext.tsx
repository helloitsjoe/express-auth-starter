/* eslint-disable react/prop-types */
import * as React from 'react';
import { Login, Token } from './services';
const { useContext, useState } = React;

// REMOVE_ANY
interface Props {
  initialValue: any;
  endpoint: string;
}

interface AuthState {
  isLoggedIn: boolean;
  token: string;
  username: string;
}

interface AuthLogIn {
  username: string;
  token: string;
}

type Auth = AuthState & {
  // REMOVE_ANY
  authLogIn: ({ username, token }: AuthLogIn) => any;
  authLogOut: () => any;
};

// REMOVE_ANY
const AuthContext = React.createContext<Auth>({} as any);

export const AuthProvider: React.FC<Props> = ({ children, initialValue, endpoint }) => {
  const localState = JSON.parse(localStorage.getItem(`auth${endpoint}`) || '{}');
  const localToken = localState.token;
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    token: localToken,
    username: '',
  });

  const authLogIn = ({ username, token }: Login & Token) => {
    const isLoggedIn = true;
    localStorage.setItem(`auth${endpoint}`, JSON.stringify({ token, username, isLoggedIn }));
    setState({ token, username, isLoggedIn });
  };

  const authLogOut = () => {
    const isLoggedIn = false;
    localStorage.setItem(`auth${endpoint}`, JSON.stringify({ isLoggedIn }));
    setState({ isLoggedIn, username: '', token: '' });
  };

  const value = { ...state, authLogIn, authLogOut };

  // console.log('isLoggedIn', state.isLoggedIn);
  return <AuthContext.Provider value={initialValue || value}>{children}</AuthContext.Provider>;
};

// REMOVE_ANY
export const withAuthProvider = <P extends object>(Component: React.FC<P>) => (props: any) => {
  const { initialValue, ...rest } = props;
  return (
    <AuthProvider initialValue={initialValue} endpoint={props.endpoint}>
      <Component {...rest} />
    </AuthProvider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
