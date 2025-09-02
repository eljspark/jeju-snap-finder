import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";

const queryClient = new QueryClient();

const App = ({ pageProps }: { pageProps?: any }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {pageProps?.packages ? (
        <Packages packages={pageProps.packages} />
      ) : pageProps?.packageData ? (
        <PackageDetail packageData={pageProps.packageData} />
      ) : (
        <Packages />
      )}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;