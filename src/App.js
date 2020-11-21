import React from 'react';
import Auth from './Auth';
import OAuth from './OAuth';
// TODO: Passport
// import Passport from './Passport';

export default function App() {
  return (
    <>
      <Auth id="jwt" title="JWT" />
      <hr />
      <Auth id="simple-token" title="Simple Token Auth" />
      <hr />
      <Auth id="session" title="Session Auth" />
      <hr />
      <OAuth title="OAuth" />
      {/* <hr />
      <Passport /> */}
      <hr />
    </>
  );
}
