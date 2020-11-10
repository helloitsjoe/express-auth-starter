/* eslint-disable react/prop-types */

import React, { useEffect, useRef } from 'react';
import { login, sendSecure, signUp, logOut, checkLoggedIn } from './services';
import { withAuthProvider, useAuth } from './AuthContext';

const useForm = initialValues => {
  const [values, setValues] = React.useState(initialValues);

  const handleChange = e => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleResetForm = () => {
    setValues(initialValues);
  };

  return { handleChange, handleResetForm, values };
};

const queryReducer = (s, a) => {
  switch (a.type) {
    case 'fetch':
      return { ...s, status: 'LOADING', errorMessage: '' };
    case 'fetch_success':
      console.log(`success:`, a.payload);
      return { ...s, status: 'SUCCESS', data: a.payload, fetchFn: login, buttonText: 'Log In' };
    case 'fetch_error':
      console.log(`error:`, a.payload);
      return { ...s, status: 'ERROR', errorMessage: a.payload };
    case 'logout':
      return { ...s, status: 'LOADING', errorMessage: '' };
    case 'logout_success':
    case 'login_expired':
      return { ...s, status: 'IDLE', data: null };
    case 'toggle_form': {
      const fetchFn = s.fetchFn === login ? signUp : login;
      const buttonText = s.buttonText === 'Log In' ? 'Sign Up' : 'Log In';
      return { ...s, fetchFn, buttonText };
    }
    default:
      return s;
  }
};

const useFetch = () => {
  const [state, dispatch] = React.useReducer(queryReducer, {
    status: 'IDLE',
    data: null,
    errorMessage: '',
    fetchFn: login,
    buttonText: 'Log In',
  });

  return { ...state, dispatch };
};

const Form = ({ id, endpoint }) => {
  const { handleChange, handleResetForm, values } = useForm({ username: '', password: '' });
  const { authLogIn, authLogOut, isLoggedIn, token } = useAuth();
  const { status, data, errorMessage, dispatch, fetchFn, buttonText } = useFetch();

  const passwordRef = useRef();

  const isLoading = status === 'LOADING';

  useEffect(() => {
    if (!token) return;

    checkLoggedIn({ endpoint, token })
      .then(res => {
        console.log(`res.data:`, res.data);
        const { username } = res.data.user;
        console.log(`username:`, username);
        authLogIn({ username, token });
      })
      .catch(err => {
        console.log(`err:`, err);
        authLogOut();
        const { message } = (err.response && err.response.data) || err;
        if (!message.match(/expired/i)) {
          return dispatch({ type: 'fetch_error', payload: message || err.response.status });
        }
        // TODO: Refresh token
        console.log('Expired token, logging out...');
        dispatch({ type: 'login_expired' });
      });
  }, [token, endpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = e => {
    e.preventDefault();
    const { username, password } = values;

    dispatch({ type: 'fetch' });
    fetchFn({ endpoint, username, password, token })
      .then(res => {
        // TODO: Use sid instead of token
        console.log(res.data);
        authLogIn({ username, token: res.data.token });
        handleResetForm();
        dispatch({ type: 'fetch_success', payload: res.data });
      })
      .catch(err => {
        const { message } = (err.response && err.response.data) || err;
        dispatch({ type: 'fetch_error', payload: message || err.response.status });
      });
  };

  const handleLogOut = e => {
    e.preventDefault();
    dispatch({ type: 'logout' });

    authLogOut();
    if (endpoint.match(/jwt/)) return dispatch({ type: 'logout_success' });

    logOut({ endpoint, token })
      .then(res => {
        console.log('logged out', res.data);
        authLogOut();
        dispatch({ type: 'logout_success' });
      })
      .catch(err => {
        authLogOut();
        const { message } = (err.response && err.response.data) || err;
        dispatch({ type: 'fetch_error', payload: message || err.response.status });
      });
  };

  return (
    <form onSubmit={isLoggedIn ? handleLogOut : handleSubmit}>
      <div className="column">
        <input
          data-testid={`${id}-login-input`}
          placeholder="Name"
          name="username"
          value={values.username}
          onChange={handleChange}
        />
        <input
          name="password"
          data-testid={`${id}-password-input`}
          placeholder="Password"
          ref={passwordRef}
          value={values.password}
          onChange={handleChange}
        />
        <div>
          {isLoggedIn ? (
            <button data-testid={`${id}-logout`} type="submit">
              Log Out
            </button>
          ) : (
            <>
              <button data-testid={`${id}-login-submit`} type="submit" disabled={isLoading}>
                {buttonText}
              </button>
              <button
                type="button"
                style={{ border: 'none', background: 'none', textDecoration: 'underline' }}
                onClick={() => {
                  passwordRef.current.focus();
                  dispatch({ type: 'toggle_form' });
                }}
              >
                Switch to {buttonText === 'Log In' ? 'Sign Up' : 'Log In'}
              </button>
            </>
          )}
        </div>
        {status === 'ERROR' && <h1 className="error">Error: {errorMessage}</h1>}
        {isLoading && <h1>Loading...</h1>}
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </form>
  );
};

// MAYBE: Move this and Form into single component so useFetch works for both?
const SendMessage = ({ id, endpoint }) => {
  const { handleChange, values } = useForm({ message: '' });
  const { status, data, errorMessage, dispatch } = useFetch();
  const { token, isLoggedIn } = useAuth();

  const isLoading = status === 'LOADING';

  const handleSubmit = e => {
    e.preventDefault();
    const { message } = values;

    dispatch({ type: 'fetch' });
    sendSecure({ endpoint, message, token })
      .then(res => {
        dispatch({ type: 'fetch_success', payload: res.data });
      })
      .catch(err => {
        const { message: errMessage } = (err.response && err.response.data) || err;
        dispatch({ type: 'fetch_error', payload: errMessage || err.response.status });
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Send a message"
        name="message"
        data-testid={`${id}-input`}
        value={values.message}
        onChange={handleChange}
      />
      <button data-testid={`${id}-submit`} type="submit" disabled={isLoading}>
        Send
      </button>
      {status === 'ERROR' && <h1 className="error">Error: {errorMessage}</h1>}
      {isLoading && <h1>Loading...</h1>}
      {isLoggedIn && data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </form>
  );
};

// TODO: Change endpoint to id
const Auth = ({ endpoint, title }) => {
  const id = endpoint.slice(1);
  const { isLoggedIn, username } = useAuth();

  return (
    <>
      <h3 style={{ display: 'inline' }}>{title}</h3>
      {isLoggedIn ? (
        <span style={{ color: 'darkseagreen' }}> Logged in as {username}</span>
      ) : (
        <span style={{ color: 'gray' }}> Logged out</span>
      )}
      <Form endpoint={endpoint} id={id} />
      <SendMessage endpoint={endpoint} id={id} />
    </>
  );
};

export default withAuthProvider(Auth);
