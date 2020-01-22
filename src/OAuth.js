import React from 'react';
import { oauth } from './services';

const OAuth = () => {
  const [oauthData, setOauthData] = React.useState();

  const handleOauth = e => {
    e.preventDefault();
    oauth().then(res => {
      setOauthData(res);
    });
  };

  return (
    <form onSubmit={handleOauth}>
      <button type="submit">Authorize with OAuth</button>
      {oauthData && <pre>{oauthData}</pre>}
    </form>
  );
};

export default OAuth;
