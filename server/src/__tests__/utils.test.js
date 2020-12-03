import { getCookie } from '../utils.ts';

describe('utils', () => {
  it('getCookie gets session cookie', () => {
    const cookie = 'foo=bar; connect.sid=s%3Asome-session-cookie.foo; baz=qux';
    const res = { headers: { 'set-cookie': [cookie] } };
    expect(getCookie(res)).toBe(cookie);
  });

  it('getCookie does not get session cookie if does not exist', () => {
    const res = { headers: {} };
    expect(getCookie(res)).toBe(undefined);
  });
});
