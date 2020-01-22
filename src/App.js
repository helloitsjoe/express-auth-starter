import React from 'react';
import Auth from './Auth';
import OAuth from './OAuth';
// import Passport from './Passport';

export default function App() {
  return (
    <>
      <Auth />
      <hr />
      <OAuth />
      {/* <hr />
      <Passport /> */}
    </>
  );
}
