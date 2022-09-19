import React from 'react';
import Head from 'next/head';

const AppHead = () => {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1.0" />
      <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>
  );
};

export default AppHead;
