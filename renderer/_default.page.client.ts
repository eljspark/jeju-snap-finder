import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import type { PageContextClient } from 'vite-plugin-ssr/types';
import '../src/index.css';

export { render };

let root: ReactDOM.Root;

async function render(pageContext: PageContextClient) {
  const { Page, pageProps } = pageContext;
  
  // Get static data from server-rendered page
  const staticData = (window as any).__STATIC_DATA__ || {};
  
  const page = React.createElement(BrowserRouter, {}, 
    React.createElement(Page, { ...pageProps, ...staticData })
  );
  
  const container = document.getElementById('root')!;
  
  if (pageContext.isHydration) {
    root = ReactDOM.hydrateRoot(container, page);
  } else {
    if (!root) {
      root = ReactDOM.createRoot(container);
    }
    root.render(page);
  }
}