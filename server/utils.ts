/* eslint-disable camelcase */
import { AxiosResponse } from 'axios';
import { AuthServerInput } from './types';
const crypto = require('crypto');

export const ONE_HOUR_IN_SECONDS = 60 * 60;

export const getTokenExp = (): number => {
  return Number(process.env.TOKEN_EXPIRATION) || ONE_HOUR_IN_SECONDS;
};

export const makeResponse = ({ message, token, status = 200 }: AuthServerInput) => ({
  message,
  status,
  token,
});

export const generateRandom = (len: number): string => {
  const rand = crypto
    .randomBytes(len)
    .toString('base64')
    .replace(/[/+=]/g, '')
    // length in bytes is greater than string length
    .slice(0, len);

  return rand;
};

export const getCookie = (res: AxiosResponse) => {
  // const KEY = 'connect.sid=s%3A';
  // const sessionId = cookies.split('; ').find(cookie => cookie.startsWith(KEY));
  // return sessionId && sessionId.replace(KEY, '').split('.')[0];
  const [cookies] = res.headers['set-cookie'] || [];
  return cookies;
};

// module.exports = {
//   ONE_HOUR_IN_SECONDS,
//   getCookie,
//   getTokenExp,
//   generateRandom,
//   makeResponse,
// };
