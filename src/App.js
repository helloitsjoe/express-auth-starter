import React from 'react';
import Auth from './Auth';
import OAuth from './OAuth';
// TODO: Passport
// import Passport from './Passport';

export default function App() {
  return (
    <>
      <Auth endpoint="/jwt" title="JWT" />
      <hr />
      <Auth endpoint="/simpleToken" title="Simple Token Auth" />
      <hr />
      <Auth endpoint="/session" title="Session Auth" />
      <hr />
      <OAuth title="OAuth" />
      {/* <hr />
      <Passport /> */}
      <hr />
    </>
  );
}
