import { createRoot } from 'react-dom/client'
import './index.css'

// This file is only used for development preview
// SSG production uses vite-plugin-ssr rendering
if (typeof window !== 'undefined') {
  const App = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Development Mode</h1>
        <p className="text-muted-foreground">
          This app uses SSG. Run <code>npm run build</code> to see the full version.
        </p>
      </div>
    </div>
  );
  
  createRoot(document.getElementById("root")!).render(<App />);
}
