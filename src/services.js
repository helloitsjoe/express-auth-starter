/* eslint-disable camelcase */
import openOauth from 'oauth-open';
import axios from 'axios';

const getUrl = (endpoint, port = 3000) => `http://localhost:${port}${endpoint}`;

let authorization;

const wait = (ms = 500, shouldFail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      return shouldFail ? reject(new Error('Oh nuts')) : resolve();
    }, ms)
  );

export function login({ username, password }) {
  return wait().then(() => axios.post(getUrl('/login', 3001), { username, password }));
}

export function oauth() {
  return new Promise((resolve, reject) => {
    openOauth(getUrl('/oauth', 3001), (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  })
    .then(params => axios.post(getUrl('/oauth/token', 3001), { code: params.code }))
    .then(({ data }) => {
      console.log(data);
      const { access_token } = data;
      authorization = access_token;
      return axios.get(getUrl('/oauth/secure', 3001), { headers: { authorization } });
    });
}

export function updateSecureData(message) {
  console.log(`authorization:`, authorization);
  return axios.post(
    getUrl('/oauth/secure', 3001),
    { message },
    {
      headers: { authorization },
    }
  );
}

export function updateLikes() {
  return fetch().then(res => res.json());
}
