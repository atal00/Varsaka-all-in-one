'use client';

import React from 'react';

export default function SecurityRedirectPage() {
  return (
    <>
      <title>404: This page could not be found.</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta httpEquiv="refresh" content="5;url=https://varsaka.com" />
      <div style={{ color: '#000', background: '#fff', margin: 0, fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Open Sans","Helvetica Neue",sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <h1 style={{ display: 'inline-block', margin: '0 20px 0 0', paddingRight: '23px', fontSize: '24px', fontWeight: 500, verticalAlign: 'top', borderRight: '1px solid rgba(0,0,0,.3)' }}>404</h1>
          <div style={{ display: 'inline-block', textAlign: 'left' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 400, lineHeight: '28px', margin: 0 }}>This page could not be found.</h2>
          </div>
        </div>
      </div>
    </>
  );
}
