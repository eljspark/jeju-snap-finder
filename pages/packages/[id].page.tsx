import App from '../../src/App.ssr';

export { Page };

function Page(props: any) {
  return <App {...props} />;
}