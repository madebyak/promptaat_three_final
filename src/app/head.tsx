import React from 'react';

export default function Head() {
  return (
    <>
      {/* Favicon definitions */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />
      
      {/* Explicit OpenGraph tags for the home page */}
      <meta property="og:title" content="Promptaat | The Largest AI Prompt Library" />
      <meta property="og:description" content="In an era where AI is reshaping creativity, crafting effective prompts can be overwhelming. Promptaat's vast collection saves you time with one-click solutions." />
      <meta property="og:image" content="https://promptaat.com/og/home-og-en.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="https://promptaat.com" />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Promptaat | The Largest AI Prompt Library" />
      <meta name="twitter:description" content="In an era where AI is reshaping creativity, crafting effective prompts can be overwhelming. Promptaat's vast collection saves you time." />
      <meta name="twitter:image" content="https://promptaat.com/og/home-og-en.jpg" />
    </>
  );
}
