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
  return wait().then(() => axios.post(getUrl('/login'), { username, password }));
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
      // eslint-disable-next-line camelcase
      const { access_token } = data;
      return axios.get(getUrl('/secure'), { headers: { authorization: access_token } });
    })
    .catch(err => {
      console.error(err);
    });
}

export function updateLikes() {
  return fetch().then(res => res.json());
}
