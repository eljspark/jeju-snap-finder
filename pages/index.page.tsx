import App from '../src/App.ssr';

export { Page };
export const prerender = true;

function Page(props: any) {
  return <App {...props} />;
}