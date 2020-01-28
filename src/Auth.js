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

const Login = () => {
  const { handleChange, values } = useForm({ username: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState();
  const [data, setData] = React.useState();

  const handleSubmit = e => {
    e.preventDefault();
    const { username, password, message } = values;

    setLoading(true);
    setError(null);
    login({ username, password })
      .then(res => {
        console.log(`res:`, res.data);
        setLoading(false);
        setData(res.data);
      })
      .catch(err => {
        console.error(`err:`, err);
        setLoading(false);
        setError(err);
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
        <button type="submit" disabled={loading}>
          Log In
        </button>
        {error && <h1 className="error">Error: {error.message}</h1>}
        {loading && <h1>Loading...</h1>}
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </form>
  );
};

const SendMessage = () => {
  const handleSubmit = () => {
    sendSecure({ message })
      .then(res => {
        // TODO
        console.log(res);
      })
      .catch(err => {
        console.error(err);
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
      <button type="submit">Send</button>
    </form>
  );
};

const Auth = () => {
  const loggedIn = false;

  return (
    <>
      <Login />
      {loggedIn && <SendMessage />}
    </>
  );
};

export default Auth;
