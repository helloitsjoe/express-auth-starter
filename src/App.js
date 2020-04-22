import React from 'react';
import Auth from './Auth';
import OAuth from './OAuth';
// import Passport from './Passport';

export default function App() {
  return (
    <>
      <h3>JWT</h3>
      <Auth endpoint="/jwt" />
      <hr />
      <h3>Session Auth</h3>
      <Auth endpoint="/session" />
      <hr />
      <h3>OAuth</h3>
      <OAuth />
      {/* <hr />
      <Passport /> */}
      <hr />
    </>
  );
}
