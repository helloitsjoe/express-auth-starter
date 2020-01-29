import React from 'react';
import { login, sendSecure } from './services';

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
      return { ...s, status: 'LOADING' };
    case 'fetch_success':
      console.log(`success:`, a.payload);
      return { ...s, status: 'SUCCESS', data: a.payload };
    case 'fetch_error':
      console.log(`error:`, a.payload);
      return { ...s, status: 'ERROR', error: a.payload };
    default:
      return s;
  }
};

const useFetch = () => {
  const [state, dispatch] = React.useReducer(queryReducer, {
    status: 'IDLE',
    data: null,
    errorMessage: '',
  });

  return { ...state, dispatch };
};

const Login = () => {
  const { handleChange, values } = useForm({ username: '', password: '' });
  const { status, data, errorMessage, dispatch } = useFetch();
  const isLoading = status === 'LOADING';

  const handleSubmit = e => {
    e.preventDefault();
    const { username, password } = values;

    dispatch({ type: 'fetch' });
    login({ username, password })
      .then(res => {
        // TODO: Set logged in in localHost
        dispatch({ type: 'fetch_success', payload: res.data });
      })
      .catch(err => {
        dispatch({ type: 'fetch_error', payload: err.message });
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="column">
        <input placeholder="Name" name="username" value={values.username} onChange={handleChange} />
        <input
          name="password"
          placeholder="Password"
          value={values.password}
          onChange={handleChange}
        />
        <button type="submit" disabled={isLoading}>
          Log In
        </button>
        {errorMessage && <h1 className="error">Error: {errorMessage}</h1>}
        {isLoading && <h1>Loading...</h1>}
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </form>
  );
};

const SendMessage = () => {
  const { handleChange, values } = useForm({ message: '' });
  const { status, data, errorMessage, dispatch } = useFetch();
  const isLoading = status === 'LOADING';

  const handleSubmit = e => {
    e.preventDefault();
    const { message } = values;

    dispatch({ type: 'fetch' });
    sendSecure({ message })
      .then(res => {
        dispatch({ type: 'fetch_success', payload: res.data });
      })
      .catch(err => {
        dispatch({ type: 'fetch_error', payload: err.message });
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Send a message"
        name="secureMessage"
        value={values.message}
        onChange={handleChange}
      />
      <button type="submit" disabled={isLoading}>
        Send
      </button>
      {errorMessage && <h1 className="error">Error: {errorMessage}</h1>}
      {isLoading && <h1>Loading...</h1>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </form>
  );
};

const Auth = () => {
  const [loggedIn, setLoggedIn] = React.useState(false);

  React.useEffect(
    () => {
      setLoggedIn(localStorage.getItem('auth'));
    },
    [
      /* ??? */
    ]
  );

  return (
    <>
      <Login />
      {loggedIn && <SendMessage />}
    </>
  );
};

export default Auth;
