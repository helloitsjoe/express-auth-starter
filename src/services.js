import openOauth from 'oauth-open';
import axios from 'axios';

const getUrl = endpoint => `http://localhost:3001${endpoint}`;
const oauthDialogPage = 'http://localhost:3001/oauth';

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
    openOauth(oauthDialogPage, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  })
    .then(({ data }) => axios.get(getUrl('/oauth/token'), { code: data.code }))
    .then(({ data }) => {
      // eslint-disable-next-line camelcase
      const { access_token } = data;
      return axios.get(getUrl('/secure'), { headers: { authorization: access_token } });
    });
}

export function updateLikes() {
  return fetch().then(res => res.json());
}
