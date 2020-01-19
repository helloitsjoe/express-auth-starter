import React from 'react';

const fakeFetch = (values, shouldFail = false) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) return reject(new Error('crap'));
      return resolve(values);
    }, 1000);
  });

export default function App() {
  const [values, setValues] = React.useState({ username: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState();
  const [data, setData] = React.useState();

  const handleChange = e => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    fakeFetch(values)
      .then(res => {
        setLoading(false);
        setData(res);
      })
      .catch(err => {
        setError(err);
      });
  };

  if (error) return <h1>{error.message}</h1>;

  if (loading) return <h1>Loading...</h1>;

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
        <button type="submit">Log In</button>
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </form>
  );
}
