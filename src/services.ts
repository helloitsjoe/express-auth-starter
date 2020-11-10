/* eslint-disable camelcase */
// @ts-ignore
import openOauth from 'oauth-open';
import axios from 'axios';

export interface Endpoint {
  endpoint: string;
}

export interface Login {
  username: string;
  password: string;
}

export interface Token {
  token: string;
}

interface Message {
  message: string;
}

const getUrl = (endpoint: string, port = 3000) => `http://localhost:${port}${endpoint}`;

const DEFAULT_MS = process.env.NODE_ENV === 'test' ? 0 : 500;

export const wait = (ms = DEFAULT_MS, shouldFail = false): Promise<void> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      return shouldFail ? reject(new Error('Oh nuts')) : resolve();
    }, ms)
  );

export function signUp({ endpoint, username, password }: Endpoint & Login) {
  return wait().then(() => axios.post(getUrl(`${endpoint}/signup`, 3001), { username, password }));
}

export function login({ endpoint, username, password }: Endpoint & Login) {
  return wait().then(() => axios.post(getUrl(`${endpoint}/login`, 3001), { username, password }));
}

export function logOut({ endpoint, token }: Endpoint & Token) {
  return wait().then(() => axios.post(getUrl(`${endpoint}/logout`, 3001), { token }));
}

export function checkLoggedIn({ endpoint, token }: Endpoint & Token) {
  return wait().then(() =>
    axios.get(getUrl(`${endpoint}/login`, 3001), {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    })
  );
}

export function sendSecure({ endpoint, message, token }: Endpoint & Token & Message) {
  return wait().then(() =>
    axios.post(
      getUrl(`${endpoint}/secure`, 3001),
      { message },
      { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
    )
  );
}

export function oauth() {
  return wait()
    .then(() => {
      return new Promise<{ code: string }>((resolve, reject) => {
        // TODO: Redirect instead of popup
        // TODO: Don't use openOauth - implement yourself
        // window.location.assign(getUrl(`/oauth?redirect_to=${window.location.href}`, 3001));
        openOauth(getUrl(`/oauth`, 3001), (err: Error, data: { code: string }) => {
          if (err) return reject(err);
          return resolve(data);
        });
      });
    })
    .then(({ code }: { code: string }) => axios.post(getUrl('/oauth/token', 3001), { code }))
    .then(({ data }: { data: { access_token: string } }) => data.access_token);
}

export function updateSecureData(message: string, authorization: string) {
  return wait().then(() => {
    const options = { headers: { authorization } };
    return axios.post(getUrl('/oauth/secure', 3001), { message }, options);
  });
}
