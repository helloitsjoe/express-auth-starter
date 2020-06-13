import React from 'react';
import { oauth, updateSecureData } from './services';

const OAuth = () => {
  const [secureData, setSecureData] = React.useState();
  const [errorMessage, setErrorMessage] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [authToken, setAuthToken] = React.useState();

  const handleOauth = () => {
    setErrorMessage('');
    return oauth()
      .then(token => {
        setAuthToken(token);
      })
      .catch(err => {
        setAuthToken(null);
        setErrorMessage(err.message);
      });
  };

  const handleSendSecure = e => {
    e.preventDefault();
    setErrorMessage('');
    return updateSecureData(message, authToken)
      .then(res => {
        setSecureData(res.data.message);
      })
      .catch(err => {
        setSecureData(null);
        setErrorMessage(err.message);
      });
  };

  return (
    <form onSubmit={handleSendSecure}>
      <div className="column">
        <button type="button" onClick={handleOauth}>
          Authorize with OAuth
        </button>
        <input
          data-testid="oauth-message-input"
          placeholder="Post a message after you log in"
          onChange={e => setMessage(e.target.value)}
          value={message}
        />
        <button type="submit">Send OAuth message</button>
        {secureData && <pre>{secureData}</pre>}
        {errorMessage && <h1 className="error">Error: {errorMessage}</h1>}
      </div>
    </form>
  );
};

export default OAuth;
