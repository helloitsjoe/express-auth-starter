const url = 'http://localhost:3000/login';

const wait = (ms = 500, shouldFail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      return shouldFail ? reject(new Error('Oh nuts')) : resolve();
    }, ms)
  );

export function login({ username, password }) {
  return wait()
    .then(() =>
      fetch(url, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )
    .then(res => res.json());
}

export function updateLikes() {
  return fetch().then(res => res.json());
}
