import React from 'react';
import Head from 'next/head';

const AppHead = () => {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1.0" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon32.png" />
      <link rel="icon" type="image/png" sizes="64x64" href="/favicon64.png" />
      <link rel="icon" type="image/png" sizes="128x128" href="/favicon128.png" />
      <meta name="description" content="" />
      <meta property="og:title" content="Seedle Finance" />
      <meta property="og:description" content="Manage Uniswap Positions" />
      <meta property="og:image" content="/seedle.png" />
      <meta property="og:url" content="https://seedle.finance" />
      <link rel="manifest" href="/site.webmanifest" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>
  );
};

export default AppHead;
