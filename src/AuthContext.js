/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from 'react';

const AuthContext = React.createContext({});

export const AuthProvider = ({ children, initialValue, endpoint }) => {
  const [state, setState] = useState({ isLoggedIn: false });

  useEffect(() => {
    // TODO: Use cookies instead of localhost?
    const { token, username, isLoggedIn } =
      JSON.parse(localStorage.getItem(`auth${endpoint}`)) || {};

    setState({ token, username, isLoggedIn });
  }, [endpoint]);

  const authorize = ({ username, token }) => {
    localStorage.setItem(`auth${endpoint}`, JSON.stringify({ token, username, isLoggedIn: true }));
    setState({ token, username, isLoggedIn: true });
  };

  const value = { ...state, authorize };

  console.log('isLoggedIn', state.isLoggedIn);
  return <AuthContext.Provider value={initialValue || value}>{children}</AuthContext.Provider>;
};

export const withAuthProvider = Component => props => {
  const { initialValue, ...rest } = props;
  return (
    <AuthProvider initialValue={initialValue} endpoint={props.endpoint}>
      <Component {...rest} />
    </AuthProvider>
  );
};

export const useAuth = () => {
  const { isLoggedIn, username, token, authorize } = useContext(AuthContext);
  return { isLoggedIn, username, token, authorize };
};
