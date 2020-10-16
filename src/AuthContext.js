/* eslint-disable react/prop-types */
import React, { useContext, useState } from 'react';

const AuthContext = React.createContext({});

export const AuthProvider = ({ children, initialValue }) => {
  const [token, setToken] = useState();
  const [username, setUsername] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const authorize = ({ username: newUsername, token: newToken }) => {
    setToken(newToken);
    setUsername(newUsername);
    setIsLoggedIn(true);
  };

  const value = { token, authorize, isLoggedIn, username };

  console.log('isLoggedIn', isLoggedIn);
  return <AuthContext.Provider value={initialValue || value}>{children}</AuthContext.Provider>;
};

export const withAuthProvider = Component => props => {
  const { initialValue, ...rest } = props;
  return (
    <AuthProvider initialValue={initialValue}>
      <Component {...rest} />
    </AuthProvider>
  );
};

export const useAuth = () => {
  const { isLoggedIn, username, token, authorize } = useContext(AuthContext);
  return { isLoggedIn, username, token, authorize };
};
