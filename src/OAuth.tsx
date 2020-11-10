/* eslint-disable react/prop-types */
import * as React from 'react';
import { oauth, updateSecureData } from './services';

interface Props {
  title: string;
}

const OAuth = ({ title }: Props) => {
  // REMOVE_ANY
  const [secureData, setSecureData] = React.useState<any>();
  const [errorMessage, setErrorMessage] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [authToken, setAuthToken] = React.useState('');

  const handleOauth = () => {
    setErrorMessage('');
    return oauth()
      .then(token => {
        setAuthToken(token);
      })
      .catch(err => {
        setAuthToken('');
        setErrorMessage(err.message);
      });
  };

  const handleSendSecure = (e: React.FormEvent<HTMLFormElement>) => {
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
      <h3 style={{ display: 'inline' }}>{title}</h3>
      {authToken ? (
        <span style={{ color: 'darkseagreen' }}> Logged in</span>
      ) : (
        <span style={{ color: 'gray' }}> Logged out</span>
      )}
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
        <button type="button" onClick={() => setAuthToken('')}>
          Log out
        </button>
        <button type="submit">Send OAuth message</button>
        {secureData && <pre>{secureData}</pre>}
        {errorMessage && <h1 className="error">Error: {errorMessage}</h1>}
      </div>
    </form>
  );
};

export default OAuth;
