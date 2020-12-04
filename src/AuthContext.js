/* eslint-disable react/prop-types */
import React, { useContext, useLayoutEffect, useState } from 'react';

const AuthContext = React.createContext({});

export const AuthProvider = ({ children, initialValue, id }) => {
  const [state, setState] = useState({ isLoggedIn: false, token: '', username: '' });

  useLayoutEffect(() => {
    // TODO: Use cookies instead of localhost?
    const { token, username, isLoggedIn } = JSON.parse(localStorage.getItem(`auth${id}`)) || {};

    setState({ token, username, isLoggedIn });
  }, [id]);
  // export const AuthProvider = ({ children, initialValue, endpoint }) => {
  //   const localState = JSON.parse(localStorage.getItem(`auth${endpoint}`)) || {};
  //   const localToken = localState.token;
  //   const [state, setState] = useState({ isLoggedIn: false, token: localToken, username: '' });

  //   // useEffect(() => {
  //   //   // TODO: Use cookies instead of localhost?
  //   //   const { token, username, isLoggedIn } =
  //   //     JSON.parse(localStorage.getItem(`auth${endpoint}`)) || {};

  //   //   setState({ token, username, isLoggedIn });
  //   // }, [endpoint]);

  const authLogIn = ({ username, token }) => {
    const isLoggedIn = true;
    localStorage.setItem(`auth${id}`, JSON.stringify({ token, username, isLoggedIn }));
    setState({ token, username, isLoggedIn });
  };

  const authLogOut = () => {
    const isLoggedIn = false;
    localStorage.setItem(`auth${id}`, JSON.stringify({ isLoggedIn }));
    setState({ isLoggedIn, username: '', token: '' });
  };

  const value = { ...state, authLogIn, authLogOut };

  // console.log('isLoggedIn', state.isLoggedIn);
  return <AuthContext.Provider value={initialValue || value}>{children}</AuthContext.Provider>;
};

export const withAuthProvider = Component => props => {
  const { initialValue, ...rest } = props;
  return (
    <AuthProvider initialValue={initialValue} id={props.id}>
      <Component {...rest} />
    </AuthProvider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
