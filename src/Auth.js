/* eslint-disable react/prop-types */

import React from 'react';
import { login, sendSecure, signUp } from './services';
import { withAuthProvider, useAuth } from './AuthContext';

const useForm = initialValues => {
  const [values, setValues] = React.useState(initialValues);

  const handleChange = e => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return { handleChange, values };
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
    fetchFn: signUp,
    buttonText: 'Sign Up',
  });

  return { ...state, dispatch };
};

const Form = ({ id, endpoint }) => {
  const { handleChange, values } = useForm({ username: '', password: '' });
  const { status, data, errorMessage, dispatch, fetchFn, buttonText } = useFetch();
  const { authorize } = useAuth();

  const isLoading = status === 'LOADING';

  const handleSubmit = e => {
    e.preventDefault();
    const { username, password } = values;

    dispatch({ type: 'fetch' });
    fetchFn({ endpoint, username, password })
      .then(res => {
        // TODO: Set logged in in localHost
        console.log(res.data);
        authorize({ username, token: res.data.token });
        dispatch({ type: 'fetch_success', payload: res.data });
      })
      .catch(err => {
        const { message } = (err.response && err.response.data) || err;
        dispatch({ type: 'fetch_error', payload: message || err.response.status });
      });
  };

  return (
    <form onSubmit={handleSubmit}>
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
          value={values.password}
          onChange={handleChange}
        />
        <div>
          <button data-testid={`${id}-login-submit`} type="submit" disabled={isLoading}>
            {buttonText}
          </button>
          <button
            type="button"
            style={{ border: 'none', background: 'none', textDecoration: 'underline' }}
            onClick={() => dispatch({ type: 'toggle_form' })}
          >
            Switch to {buttonText === 'Log In' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
        {status === 'ERROR' && <h1 className="error">Error: {errorMessage}</h1>}
        {isLoading && <h1>Loading...</h1>}
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </form>
  );
};

const SendMessage = ({ id, endpoint }) => {
  const { handleChange, values } = useForm({ secureMessage: '' });
  const { status, data, errorMessage, dispatch } = useFetch();
  const { token } = useAuth();

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
        name="secureMessage"
        data-testid={`${id}-input`}
        value={values.secureMessage}
        onChange={handleChange}
      />
      <button data-testid={`${id}-submit`} type="submit" disabled={isLoading}>
        Send
      </button>
      {errorMessage && <h1 className="error">Error: {errorMessage}</h1>}
      {isLoading && <h1>Loading...</h1>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
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
