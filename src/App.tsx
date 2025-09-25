import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// This App.tsx is now only used for development
// Production uses App.ssr.tsx through vite-plugin-ssr
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Development Mode</h1>
          <p className="text-muted-foreground">
            This app uses SSG. Run <code>npm run build</code> to see the full version.
          </p>
        </div>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
