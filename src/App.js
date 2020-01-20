import React from 'react';
import { login, oauth } from './services';

const fakeFetch = (values, shouldFail = false) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) return reject(new Error('crap'));
      return resolve(values);
    }, 500);
  });

export default function App() {
  const [values, setValues] = React.useState({ username: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState();
  const [data, setData] = React.useState();

  const [oauthData, setOauthData] = React.useState();

  const handleChange = e => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { username, password } = values;

    setLoading(true);
    setError(null);
    // fakeFetch(values, true)
    login({ username, password })
      .then(res => {
        console.log(`res:`, res.data);
        setLoading(false);
        setData(res);
      })
      .catch(err => {
        console.error(`err:`, err);
        setLoading(false);
        setError(err);
      });
  };

  const handleOauth = e => {
    e.preventDefault();
    oauth().then(res => {
      setOauthData(res);
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="column">
          <input
            placeholder="Name"
            name="username"
            value={values.username}
            onChange={handleChange}
          />
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
      <hr />
      <form onSubmit={handleOauth}>
        <button type="submit">Authorize with OAuth</button>
        {oauthData && <pre>{oauthData}</pre>}
      </form>
    </>
  );
}
