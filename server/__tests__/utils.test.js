import { getSessionCookie } from '../utils';

describe('utils', () => {
  it('getSessionCookie gets session cookie', () => {
    const headers = { 'set-cookie': ['foo=bar; connect.sid=s%3Asome-session-cookie.foo; baz=qux'] };
    expect(getSessionCookie(headers)).toBe('some-session-cookie');
  });

  it('getSessionCookie does not get session cookie if does not exist', () => {
    const headers = { 'set-cookie': ['foo=bar; baz=qux'] };
    expect(getSessionCookie(headers)).toBe(undefined);
  });
});
