/* eslint-disable camelcase */
import openOauth from 'oauth-open';
import axios from 'axios';

const getUrl = (endpoint, port = 3000) => `http://localhost:${port}${endpoint}`;

const wait = (ms = 500, shouldFail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      return shouldFail ? reject(new Error('Oh nuts')) : resolve();
    }, ms)
  );

export function login({ username, password }) {
  return wait().then(() => axios.post(getUrl('/jwt/login', 3001), { username, password }));
}

export function sendSecure(message, authorization) {
  return wait().then(() =>
    axios.post(getUrl('/jwt/secure', 3001), { message }, { headers: { authorization } })
  );
}

export function oauth() {
  return new Promise((resolve, reject) => {
    openOauth(getUrl('/oauth', 3001), (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  })
    .then(params => axios.post(getUrl('/oauth/token', 3001), { code: params.code }))
    .then(({ data }) => data.access_token);
  //   const getPromise = axios.get(getUrl('/oauth/secure', 3001), {
  //     headers: { authorization: access_token },
  //   });
  //   return Promise.all([getPromise, access_token]);
  // })
  // .then(([data, access_token]) => ({ data, access_token }));
}

export function updateSecureData(message, authorization) {
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
