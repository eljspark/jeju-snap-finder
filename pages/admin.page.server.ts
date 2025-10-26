export async function prerender() {
  return [{ url: '/admin' }];
}

export async function onBeforeRender() {
  // TODO: Add authentication check here
  // For now, allow access to anyone
  return {
    pageContext: {
      pageProps: {}
    }
  };
}
