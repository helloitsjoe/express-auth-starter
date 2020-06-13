import React from 'react';
import { login, sendSecure } from './services';
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
      return { ...s, status: 'SUCCESS', data: a.payload };
    case 'fetch_error':
      console.log(`error:`, a.payload);
      return { ...s, status: 'ERROR', errorMessage: a.payload };
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

const Login = ({ id, endpoint }) => {
  const { handleChange, values } = useForm({ username: '', password: '' });
  const { status, data, errorMessage, dispatch } = useFetch();
  const { logIn } = useAuth();

  const isLoading = status === 'LOADING';

  const handleSubmit = e => {
    e.preventDefault();
    const { username, password } = values;

    dispatch({ type: 'fetch' });
    login({ endpoint, username, password })
      .then(res => {
        // TODO: Set logged in in localHost
        console.log(res.data);
        logIn(res.data.token);
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
        <button data-testid={`${id}-login-submit`} type="submit" disabled={isLoading}>
          Log In
        </button>
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
        const { message } = (err.response && err.response.data) || err;
        dispatch({ type: 'fetch_error', payload: message || err.response.status });
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
const Auth = ({ endpoint }) => {
  const auth = useAuth();

  const id = endpoint.slice(1);

  return (
    <>
      <Login endpoint={endpoint} id={id} />
      <SendMessage endpoint={endpoint} id={id} />
    </>
  );
};

export default withAuthProvider(Auth);
